#!/usr/bin/env python3
"""Q2: 预算约束 p-中位选址 —— 全枚举精确求解 + 预算-目标曲线 + 灵敏度/红队。

输入:  data/districts.csv, data/candidate_sites.csv, data/distance_matrix.csv
输出:  results/q2_result.json, results/q2_budget_curve.csv, results/q2_mc.json,
       results/q2_sens_*.md, figures/fig3_budget.png, figures/fig4_tornado.png, figures/fig5_mc.png
运行:  cd job_80ad98ef && python code/q2_budget.py
"""
import csv
import json
from itertools import combinations
from pathlib import Path

import numpy as np

from plot_setup import plt, savefig, paper_style
from sensitivity import tornado, sweep, report

ROOT = Path(__file__).resolve().parent.parent
P = 3
B_NOMINAL = 12.0   # 名义预算（百万元）
TOL = 1e-9
SEED = 42


def load_all():
    with open(ROOT / "data" / "districts.csv", encoding="utf-8") as f:
        districts = list(csv.DictReader(f))
    with open(ROOT / "data" / "candidate_sites.csv", encoding="utf-8") as f:
        sites = list(csv.DictReader(f))
    D = np.loadtxt(ROOT / "data" / "distance_matrix.csv",
                   delimiter=",", skiprows=1, usecols=range(1, 9))
    w = np.array([float(d["demand_t_per_day"]) for d in districts])
    c = np.array([float(s["cost_million_yuan"]) for s in sites])
    sids = [s["site_id"] for s in sites]
    names = [d["district_id"] for d in districts]
    return names, sids, w, c, D


def objective(S, w, D):
    S = list(S)
    return float((w * D[:, S].min(axis=1)).sum())


def solve(w, c, D, B):
    """精确枚举。返回 (最优集合 tuple 或 None, z* 或 None)。"""
    best_z, best_S = np.inf, None
    for S in combinations(range(len(c)), P):
        if c[list(S)].sum() <= B + TOL:
            z = objective(S, w, D)
            if z < best_z - TOL:
                best_z, best_S = z, S
    return best_S, (best_z if best_S is not None else None)


def main():
    rng = np.random.default_rng(SEED)
    names, sids, w, c, D = load_all()
    m = len(sids)

    # 全部组合的成本-目标表
    combos = []
    for S in combinations(range(m), P):
        combos.append((S, float(c[list(S)].sum()), objective(S, w, D)))

    # 名义预算求解
    S_nom, z_nom = solve(w, c, D, B_NOMINAL)
    assert S_nom is not None, "名义预算下不可行"
    # 无预算约束最优（B->inf 退化检验）
    S_unc, z_unc = solve(w, c, D, np.inf)
    assert z_unc <= z_nom + TOL, "加预算约束后目标不得优于无约束"
    cost_unc = float(c[list(S_unc)].sum())

    # 可行性逐条验证
    assert len(S_nom) == P and c[list(S_nom)].sum() <= B_NOMINAL + TOL
    assign = {names[i]: sids[S_nom[np.argmin(D[i, list(S_nom)])]] for i in range(len(names))}

    # ---- 预算-目标曲线 z*(B)：Pareto 有效断点 ----
    pts = sorted(combos, key=lambda t: t[1])
    frontier = []
    best = np.inf
    for S, cost, z in pts:
        if z < best - TOL:
            frontier.append((cost, z, S))
            best = z
    b_min = min(cost for _, cost, _ in pts)
    grid = np.round(np.arange(b_min, 15.01, 0.01), 2)
    with open(ROOT / "results" / "q2_budget_curve.csv", "w", newline="", encoding="utf-8") as f:
        wr = csv.writer(f)
        wr.writerow(["B_million", "z_star", "opt_sites"])
        for B in grid:
            S_b, z_b = solve(w, c, D, B)
            wr.writerow([f"{B:.2f}", f"{z_b:.4f}", "+".join(sids[j] for j in S_b)])
    # 单调性断言（解析性质：预算放松目标不增）
    zs = [solve(w, c, D, B)[1] for B in grid]
    assert all(zs[k] >= zs[k + 1] - TOL for k in range(len(zs) - 1)), "z*(B) 必须单调不增"

    # ---- 灵敏度 ----
    # (a) 需求统一比例缩放 alpha：最优集合应不变（实现正确性校验）
    scale_check = all(solve(w * a, c, D, B_NOMINAL)[0] == S_nom
                      for a in (0.8, 0.9, 1.1, 1.2))

    # (b) Monte Carlo：各片区需求独立 U(0.8,1.2) 倍扰动，统计最优集合翻转
    N_MC = 200
    counts = {}
    for k in range(N_MC):
        if k % 50 == 0:
            print(f"MC {k}/{N_MC}")
        wp = w * rng.uniform(0.8, 1.2, size=len(w))
        S_p, _ = solve(wp, c, D, B_NOMINAL)
        counts["+".join(sids[j] for j in S_p)] = counts.get("+".join(sids[j] for j in S_p), 0) + 1
    flip_rate = 1.0 - counts.get("+".join(sids[j] for j in S_nom), 0) / N_MC

    # (c) 单参数 ±20% 扫描（sensitivity.py）：各片区需求 → z* 相对变化 → tornado
    def mk(i):
        def fn(r):
            wp = w.copy(); wp[i] = r  # r 为扰动后的绝对需求值
            _, zp = solve(wp, c, D, B_NOMINAL)
            return {"z*": zp}
        return fn
    multi = {f"{nm}需求": {"res": sweep(mk(i), base=float(w[i]), label=f"{nm}需求"), "max_dev": None}
             for i, nm in enumerate(names)}
    for k, v in multi.items():
        rel = v["res"]["points"]
        b = v["res"]["base_out"]["z*"]
        v["max_dev"] = max(abs(p["z*"] - b) / abs(b) * 100.0 for _, p in rel)
    tornado(multi, "fig4_tornado.png")

    # (d) 预算 ±5%~20% 扫描（报告扰动表 + 曲线）
    def fn_B(Bv):
        S_b, z_b = solve(w, c, D, Bv)
        return {"z*": z_b if z_b is not None else np.nan}
    res_B = sweep(fn_B, base=B_NOMINAL, label="预算 B / 百万元",
                  ratios=[0.95, 0.96, 0.97, 0.98, 0.99, 1.00, 1.05, 1.10, 1.15, 1.20])
    report(res_B, "fig6_sens_budget.png", ylabel="z* 相对变化 / %", results_dir=ROOT / "results")

    # ---- 红队（Q2）----
    red = {}
    # T1: B 恰等于断点成本（取最小可行预算 b_min）
    S_t1, z_t1 = solve(w, c, D, b_min)
    red["T1_B_at_breakpoint"] = {"B": b_min, "opt": [sids[j] for j in S_t1], "z": round(z_t1, 4)}
    # T2: B 低于最小可行预算 → 应返回不可行而非崩溃
    S_t2, z_t2 = solve(w, c, D, b_min - 0.5)
    red["T2_B_below_min"] = {"feasible": S_t2 is not None}
    # T3: 需求全 0 → 目标恒 0，任意可行解皆最优
    S_t3, z_t3 = solve(np.zeros_like(w), c, D, B_NOMINAL)
    red["T3_zero_demand"] = {"z": z_t3, "opt_valid": S_t3 is not None}
    # T4: B 恰为名义预算 ±0.0001（断点邻域数值稳定）
    red["T4_B_epsilon"] = {"minus": round(solve(w, c, D, B_NOMINAL - 1e-4)[1], 4),
                           "plus": round(solve(w, c, D, B_NOMINAL + 1e-4)[1], 4)}

    # ---- 结果汇总 ----
    result = {
        "B_nominal": B_NOMINAL,
        "opt_sites": [sids[j] for j in S_nom],
        "cost_million": round(float(c[list(S_nom)].sum()), 2),
        "z_star": round(z_nom, 4),
        "assignment": assign,
        "unconstrained": {"sites": [sids[j] for j in S_unc], "cost": cost_unc,
                          "z": round(z_unc, 4),
                          "objective_loss_pct": round((z_nom - z_unc) / z_unc * 100, 2)},
        "budget_min_feasible": b_min,
        "frontier": [{"B": round(c0, 2), "z": round(z0, 4),
                      "sites": [sids[j] for j in S0]} for c0, z0, S0 in frontier],
        "scale_invariance_check": bool(scale_check),
        "mc": {"n": N_MC, "seed": SEED, "flip_rate": flip_rate, "counts": counts},
        "demand_sensitivity_max_dev_pct": {k: round(v["max_dev"], 3) for k, v in multi.items()},
        "redteam": red,
    }
    (ROOT / "results" / "q2_result.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    (ROOT / "results" / "q2_mc.json").write_text(
        json.dumps({"counts": counts, "flip_rate": flip_rate}, ensure_ascii=False, indent=2),
        encoding="utf-8")

    # ---- 图 3：预算-目标曲线 ----
    fig, ax = plt.subplots(figsize=(7.0, 4.4))
    ax.step(grid, zs, where="post", color="#2F5597", lw=1.6, label="$z^*(B)$")
    for c0, z0, S0 in frontier:
        ax.plot([c0], [z0], "o", ms=5, color="#C00000")
    ax.axvline(B_NOMINAL, color="#888888", lw=1.0, ls="--")
    ax.annotate(f"名义预算 B={B_NOMINAL}", (B_NOMINAL, zs[0]), textcoords="offset points",
                xytext=(6, 0), fontsize=9, color="#555555")
    ax.set_xlabel("预算 B / 百万元")
    ax.set_ylabel("最优总加权距离 z* / (t·km·d$^{-1}$)")
    ax.legend(fontsize=9)
    paper_style(ax)
    savefig(fig, "fig3_budget.png", insert_cm=12.0)

    # ---- 图 5：Monte Carlo 最优集合频次 ----
    fig, ax = plt.subplots(figsize=(7.0, 3.6))
    items = sorted(counts.items(), key=lambda kv: -kv[1])
    labels = [k for k, _ in items]
    vals = [v / N_MC * 100 for _, v in items]
    colors = ["#C00000" if k == "+".join(sids[j] for j in S_nom) else "#2F5597" for k in labels]
    ax.bar(range(len(vals)), vals, color=colors, alpha=0.88, width=0.6)
    ax.set_xticks(range(len(vals)))
    ax.set_xticklabels(labels, fontsize=9)
    ax.set_ylabel("出现频率 / %")
    ax.set_xlabel("最优选址集合（红 = 名义最优）")
    paper_style(ax)
    savefig(fig, "fig5_mc.png", insert_cm=12.0)

    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
