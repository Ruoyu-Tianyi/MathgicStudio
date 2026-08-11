#!/usr/bin/env python3
"""Q1: p-中位选址模型（无预算约束）——全枚举精确求解 + 贪心基线 + 下界检验 + 红队对抗。

输入:  data/districts.csv, data/candidate_sites.csv
输出:  data/distance_matrix.csv, results/q1_solutions.csv, results/q1_result.json,
       results/q1_redteam.json, figures/fig1_route.png, figures/fig2_map.png
运行:  cd job_80ad98ef && python code/q1_pmedian.py
"""
import csv
import json
from itertools import combinations
from pathlib import Path

import numpy as np

from plot_setup import plt, savefig, paper_style, flow

ROOT = Path(__file__).resolve().parent.parent
P = 3  # 建站数
TOL = 1e-9


def load_data():
    with open(ROOT / "data" / "districts.csv", encoding="utf-8") as f:
        districts = list(csv.DictReader(f))
    with open(ROOT / "data" / "candidate_sites.csv", encoding="utf-8") as f:
        sites = list(csv.DictReader(f))
    return districts, sites


def distance_matrix(districts, sites):
    dxy = np.array([[float(d["x_km"]), float(d["y_km"])] for d in districts])
    sxy = np.array([[float(s["x_km"]), float(s["y_km"])] for s in sites])
    D = np.sqrt(((dxy[:, None, :] - sxy[None, :, :]) ** 2).sum(axis=2))
    return D


def objective(S, w, D):
    """z(S) = sum_i w_i * min_{j in S} d_ij  （引理 1：最近指派）"""
    S = list(S)
    return float((w * D[:, S].min(axis=1)).sum())


def greedy(w, D, p=P):
    """贪心基线：每步加入使目标下降最多的站点。"""
    S = []
    while len(S) < p:
        cand = min((j for j in range(D.shape[1]) if j not in S),
                   key=lambda j: objective(S + [j], w, D))
        S.append(cand)
    return S, objective(S, w, D)


def main():
    districts, sites = load_data()
    n, m = len(districts), len(sites)
    w = np.array([float(d["demand_t_per_day"]) for d in districts])
    names = [d["district_id"] for d in districts]
    sids = [s["site_id"] for s in sites]
    D = distance_matrix(districts, sites)

    # 距离矩阵落盘（派生数据，可复现）
    with open(ROOT / "data" / "distance_matrix.csv", "w", newline="", encoding="utf-8") as f:
        wr = csv.writer(f)
        wr.writerow(["district"] + sids)
        for i, nm in enumerate(names):
            wr.writerow([nm] + [f"{D[i, j]:.4f}" for j in range(m)])

    # 全枚举：56 个组合
    rows = []
    for S in combinations(range(m), P):
        z = objective(S, w, D)
        rows.append((S, z))
    rows.sort(key=lambda t: t[1])
    z_star = rows[0][1]
    opt_sets = [S for S, z in rows if abs(z - z_star) < TOL]  # 并列最优（良态性检查项）

    # 下界：放松基数耦合，每片区由全局最近点服务
    lb = float((w * D.min(axis=1)).sum())
    assert z_star >= lb - TOL, "最优值不得小于下界"

    # 贪心基线
    S_g, z_g = greedy(w, D)
    gap = (z_g - z_star) / z_star * 100.0

    # 不变量断言：最优解的每片区恰指派一站；建站数恰为 3
    S0 = opt_sets[0]
    assign = D[:, S0].argmin(axis=1)
    assert len(S0) == P and assign.shape == (n,)
    service = [sids[S0[a]] for a in assign]

    # ---- 红队对抗（推导稿六检查第 6 项）----
    red = {}
    # R1: 某片区需求 w_i -> 0（取 D3，需求最小者），最优集合中离 D3 最近的专属站应可被替换
    w0 = w.copy(); w0[2] = 1e-6
    z_r1 = min((objective(S, w0, D), S) for S in combinations(range(m), P))
    red["R1_demand_to_zero"] = {"opt_set": [sids[j] for j in z_r1[1]], "z": round(z_r1[0], 4)}
    # R2: 两个候选点坐标完全相同（S9 = S1 副本）：枚举不崩溃，最优值不变，
    #     且每个含 S1 的方案都能在"用 S9 替换 S1"后取到相同目标值
    D2 = np.column_stack([D, D[:, 0]])
    z_r2 = min(objective(S, w, D2) for S in combinations(range(m + 1), P))
    paired = all(
        any(abs(objective(tuple(j2 if j2 != 0 else m for j2 in S), w, D2) - objective(S, w, D2)) < TOL
            for S2_ in [tuple(m if j == 0 else j for j in S)])
        for S in combinations(range(m), P) if 0 in S)
    red["R2_duplicate_site"] = {"z_star": round(z_r2, 9), "equals_base": abs(z_r2 - z_star) < TOL,
                                "mirror_pairs_exist": bool(paired)}
    # R3: 极远点（1000 km 外）——任何最优解都不应选它
    D3m = np.column_stack([D, np.full(n, 1000.0)])
    z_r3 = min((objective(S, w, D3m), S) for S in combinations(range(m + 1), P))
    red["R3_far_site"] = {"far_index_in_opt": (m in z_r3[1]), "z": round(z_r3[0], 4)}
    # R4: 极端比例（w 最大/最小 = 4.0，本数据 48/12=4.0 已满足；再放大到 40 倍）
    w4 = w.copy(); w4[3] = w4[3] * 10.0  # D4 需求放大 10 倍
    z_r4 = min((objective(S, w4, D), S) for S in combinations(range(m), P))
    nearest_d4 = int(D[3].argmin())
    red["R4_extreme_weight"] = {"opt_set": [sids[j] for j in z_r4[1]],
                                "contains_D4_nearest": nearest_d4 in z_r4[1], "z": round(z_r4[0], 4)}

    # ---- 结果落盘 ----
    (ROOT / "results").mkdir(exist_ok=True)
    with open(ROOT / "results" / "q1_solutions.csv", "w", newline="", encoding="utf-8") as f:
        wr = csv.writer(f)
        wr.writerow(["rank", "sites", "objective_t_km_per_day"])
        for k, (S, z) in enumerate(rows, 1):
            wr.writerow([k, "+".join(sids[j] for j in S), f"{z:.4f}"])
    result = {
        "p": P, "n_districts": n, "n_sites": m, "n_combos": len(rows),
        "optimal_sets": [[sids[j] for j in S] for S in opt_sets],
        "z_star_t_km_per_day": round(z_star, 4),
        "assignment": {names[i]: {"site": service[i], "dist_km": round(float(D[i, S0[assign[i]]]), 4)} for i in range(n)},
        "per_district_cost": {names[i]: round(float(w[i] * D[i, S0[assign[i]]]), 4) for i in range(n)},
        "lower_bound": round(lb, 4),
        "greedy": {"sites": [sids[j] for j in S_g], "z": round(z_g, 4), "gap_pct": round(gap, 4)},
        "top5": [[("+".join(sids[j] for j in S)), round(z, 4)] for S, z in rows[:5]],
    }
    (ROOT / "results" / "q1_result.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    (ROOT / "results" / "q1_redteam.json").write_text(
        json.dumps(red, ensure_ascii=False, indent=2), encoding="utf-8")

    # ---- 图 1：技术路线图 ----
    flow([[("a", "赛题数据与假设")],
          [("b", "欧氏距离矩阵")],
          [("c", "Q1：p-中位全枚举"), ("d", "Q2：预算约束选址")],
          [("e", "精确最优解"), ("f", "预算-目标曲线 z*(B)")],
          [("g", "检验：下界/贪心 gap/红队"), ("h", "灵敏度：需求扰动与断点分析")]],
         [("a", "b"), ("b", "c"), ("b", "d"), ("c", "e"), ("d", "f"),
          ("e", "g"), ("f", "h"), ("g", "h")],
         "fig1_route.png", orientation="tb")

    # ---- 图 2：选址方案地图 ----
    fig, ax = plt.subplots(figsize=(7.2, 5.6))
    dxy = np.array([[float(d["x_km"]), float(d["y_km"])] for d in districts])
    sxy = np.array([[float(s["x_km"]), float(s["y_km"])] for s in sites])
    ax.scatter(sxy[:, 0], sxy[:, 1], marker="s", s=55, color="#999999",
               zorder=3, label="候选点（未建）")
    ax.scatter(sxy[S0, 0], sxy[S0, 1], marker="s", s=110, color="#C00000",
               zorder=4, label="最优建站")
    sc = ax.scatter(dxy[:, 0], dxy[:, 1], s=w * 6, color="#2F5597", zorder=4,
                    label="片区（大小∝需求）")
    for i in range(n):
        j = S0[assign[i]]
        ax.plot([dxy[i, 0], sxy[j, 0]], [dxy[i, 1], sxy[j, 1]],
                color="#C00000", lw=1.1, alpha=0.75, zorder=2)
    for j, sid in enumerate(sids):
        ax.annotate(sid, (sxy[j, 0], sxy[j, 1]), textcoords="offset points",
                    xytext=(7, 7), fontsize=9)
    for i, nm in enumerate(names):
        ax.annotate(nm, (dxy[i, 0], dxy[i, 1]), textcoords="offset points",
                    xytext=(7, -13), fontsize=9, color="#2F5597")
    ax.set_xlabel("x / km"); ax.set_ylabel("y / km")
    ax.legend(fontsize=9, loc="upper left")
    paper_style(ax)
    ax.set_aspect("equal")
    savefig(fig, "fig2_map.png", insert_cm=12.0)

    print(json.dumps(result, ensure_ascii=False, indent=2))
    print("redteam:", json.dumps(red, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
