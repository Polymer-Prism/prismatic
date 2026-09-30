# Science notes — PRISMatic (PET reference system)

**Status: illustrative demonstrator.** Every numeric parameter in `prismatic.html` is a
*literature-scaled placeholder* or an *illustrative design choice*, held in the single `PET`
constant block at the top of the script. Nothing here is a fitted, measured, or validated result. The
inference is an **emulated PENN** (an analytic inverse of the forward placeholder models), not a
trained physics-enforced neural network. When WP1/WP2/WP4 deliver fitted parameters and WP3 trains
the PENN, they replace the `PET` block and `inferState()` without changing the interface.

Parameters are anchored to the published literature cited in §4 and §8. Any value that could not be
anchored is marked **illustrative — no source**, both here and in the code comments.

---

## 1. Physics-informed functional forms (the shapes the real models will fit)

These forms encode known PET degradation physics; only their **parameters** are placeholder.

| Property | Form (in code) | Physical rationale |
|---|---|---|
| Intrinsic viscosity `IV(n)`, Mₙ `MN(n)` | exponential decay to a floor (`expDecay`) | random chain scission during melt reprocessing lowers molar mass toward an asymptote |
| Carbonyl index `CI(n)`, carboxyl endgroups `COOH(n)` | saturating growth (`satGrow`) | thermo-oxidation accumulates then saturates as accessible sites deplete |
| Tensile strength `TS(n)`, elongation-at-break `EB(n)` | decreasing sigmoid (`sig`) | mechanical properties hold, then fall past a critical degradation; **EB collapses earliest** |
| Glycolysis yield `YIELD(n)` | saturating growth, gentle (`satGrow`) | illustrative WP2 tendency — see §3 caveat |
| Depolymerisation rate `RATEREL(n)` | rises as Mₙ falls | shorter chains → more chain ends → faster catalysed glycolysis (kinetics) |
| GWP / cost, mechanical vs chemical | mechanical rises with degradation (virgin top-up); chemical ≈ flat | per-functional-unit LCA/TEA; preserves the sustainability **crossover** |

Composite recyclability `Mcomp(n)` is a weighted, threshold-normalised blend of IV/TS/EB
(a WP1 D1.2-style index — weights and threshold are illustrative design choices). Three transition
cycles are found by root-finding: **N_tech** (M below limit), **N_sust** (GWP/cost crossover),
**N_chem** (glycolysis efficient). Decision fusion sigmoid-blends the three into a composite score
→ route (mechanical / hybrid / chemical) + a heuristic **decision-stability** figure derived by
propagating the B-PINN-style uncertainty band ±dn through the route boundaries.

---

## 2. Parameter table — anchored values

| Parameter | Value | Basis |
|---|---|---|
| `iv.lim` / `iv.tau` | **0.58 / 6.0** | fibre-grade floor; gives IV(5)≈0.68 (anchor ~0.65). Straková 2026; RSC 2024 |
| `mn.lim` | **12000** | consistent with the IV asymptote (Mark–Houwink coupling). RSC 2024 |
| `cooh.lim` / `cooh.tau` | **155 / 6.5** | near-linear over first 5 cycles; COOH(5)≈100. Spinacé & De Paoli 2001 |
| `ts` | **`{lim:28, nc:6.0, w:1.6, span:22}`** | virgin TS≈49.5 MPa; EB collapses before TS (nc_EB < nc_TS). IECR 2025 |
| `fail.iv` | **0.60** | fibre-grade mechanical-viability floor (end-of-life for reprocessing). Industry specs |
| `yield` | **`{v0:0.80, lim:0.90, tau:3.5}`** | swing kept small; **illustrative weak tendency** (see §3). Xi 2005 |
| `yTarget` | **0.878** | set so N_chem remains the latest transition |
| `GWP_chem(n)` | **flat 2.05** | chemical ≈ flat per functional unit. ACS SusChemEng 2025 |
| `gwp.virginTopUp` | **2.20** | virgin PET GWP ≈2.23 kg CO₂e/kg. NAPCOR/APR 2018 |

**Resulting values:** N_tech = 3.97 < N_sust = 4.27 < N_chem = 5.29; IV(5)=0.68; virgin TS=49.5 MPa;
COOH(5)=100 eq/10⁶ g; RATEREL(5)=1.47; zones read mech→hybrid→chem across the cycle axis.

Key anchors the parameters are tuned to:
- Virgin bottle-grade PET **IV ≈ 0.78–0.85 dL/g**; declines ~**0.80→0.65** over several extrusion cycles (chain scission).
- **Carboxyl endgroups ≈ 36 → ~100 eq/10⁶ g over ~5 cycles**, roughly linear.
- Grade floors: **bottle ≥ 0.72**, **fibre 0.60–0.68 dL/g** — mechanical-viability limit sits at the fibre floor.
- Virgin **Mₙ ≈ 24 000–30 000 g/mol**; **TS ≈ 50–55 MPa**; EB highly process-dependent, collapses early.
- Glycolysis → BHET at **180–196 °C, ethylene glycol, Zn(OAc)₂**; **BHET yield ~80–92 %**; lower Mₙ / smaller particle size **accelerates rate**.
- Virgin PET **GWP ≈ 2.15–2.23 kg CO₂e/kg**; mechanical cheap per kg but per-functional-unit impact rises with degradation; chemical higher but ≈ flat → crossover.

---

## 3. Internal-consistency & honesty notes

- **WP2 yield-vs-degradation is a *weak* tendency, flagged illustrative.** Literature robustly supports
  degradation accelerating glycolysis **rate/kinetics** (shorter chains, more chain ends), not
  necessarily a higher equilibrium **yield**; oxidation actually harms BHET purity/selectivity (captured
  by `PURITY(n)` falling with CI). The demonstrator keeps a gentle yield rise as the transition driver
  but surfaces `RATEREL(n)` as the physically grounded signal and labels the yield row "illustrative".
- **Transition ordering** is maintained: **N_tech < N_sust < N_chem**, giving near-virgin → mechanical,
  mid-range → hybrid, heavily degraded → chemical.
- **Decision stability** is a *heuristic*, not a calibrated probability, and is labelled as such on
  screen; the tier constants are illustrative and documented in code comments.
- **Units** are consistent: IV dL/g, Mₙ g/mol, COOH eq/10⁶ g, CI dimensionless (band-ratio, instrument-
  dependent → illustrative scale), GWP kg CO₂e per **functional** kg, cost GBP per functional kg.
- **Exports are self-labelling** (`status:"demonstrator-illustrative"`, `_illustrative:true`, log
  string) so a downloaded record cannot be mistaken for measured characterization; Đ (Mw/Mn) is annotated
  as an assumed most-probable value.

---

## 4. Citations (sources checked 1 July 2026; DOIs, authors and years re-verified against Crossref 30 September 2026)

**Degradation / mechanical (WP1)**
- Spinacé, M.A.S.; De Paoli, M.-A. *J. Appl. Polym. Sci.* **2001**, 80(1), 20–30. DOI 10.1002/1097-4628(20010404)80:1<20::AID-APP1069>3.0.CO;2-S. — COOH 36→~100 eq/10⁶ g over 5 cycles, ~linear.
- Straková, M.; Hlaváčiková, S.; Feranc, J. et al. "Effects of Repeated Thermo-Mechanical Processing on the Degradation Behavior of Bottle-Grade PET Under Controlled Conditions." *Polymers* **2026**, 18(3), 416. DOI 10.3390/polym18030416. — IV ≈0.80→0.65 over up to four extrusion cycles; crystallinity ≈23→29.5 %; darkening correlated with IV.
- Fiorillo et al. "Molecular and material property variations during … mechanical recycling of PET." *RSC Sustainability* **2024**. DOI 10.1039/D4SU00485J. — Mₙ decline, dispersity, property evolution.
- Stephan et al. "Recycling-Induced Changes … PET Monopolymer Blends." *J. Polym. Sci.* **2026**. DOI 10.1002/pol.20251151. — EB/TS decline with cycles.
- Gonçalves Marques, G. et al. "Effect of Mechanical Recycling on Structural Modification and Mechanical Behavior of PET." *Ind. Eng. Chem. Res.* **2025**, 64(6), 3383–3396. DOI 10.1021/acs.iecr.4c03818. — EB collapses earliest.

**Carbonyl index (FTIR)**
- Rostampour, S. et al. (NIST) — carbonyl index of PET vs exposure (saturating). NIST pub 957731.
- Almond, J. et al. "Determination of the carbonyl index of polyethylene and polypropylene using specified area under band methodology with ATR-FTIR spectroscopy." *e-Polymers* **2020**. DOI 10.1515/epoly-2020-0041. — shown for PE/PP: CI is a definition-dependent band ratio (→ illustrative scale).

**IV / grade specifications (industry)**
- Bottle grade 0.72–0.88; fibre grade 0.60–0.68 dL/g (Chemate; PolymerCircle; Polisan Hellas PET datasheet).

**Chemical recycling / glycolysis (WP2)**
- Xi, G.; Lu, M.; Sun, C. *Polym. Degrad. Stab.* **2005**, 87(1), 117–120. DOI 10.1016/j.polymdegradstab.2004.07.017. — 190–196 °C, Zn(OAc)₂, ~80% BHET / 100% conversion.
- López-Fonseca, R. et al. "Kinetics of catalytic glycolysis of PET wastes with sodium carbonate." *Chem. Eng. J.* **2011**, 168(1), 312–320. DOI 10.1016/j.cej.2011.01.031. — glycolysis kinetics; rate ↑ as particle size ↓ / accessibility ↑.
- "Boosting the kinetics of PET glycolysis." *React. Chem. Eng.* **2024**. DOI 10.1039/D4RE00235K.
- "PET Glycolysis: Kinetic Modeling and Validation." PMC12389461 **2025**.
- "Glycolytic Depolymerization of Post-Consumer PET with Sodium Methoxide." PMC9921498. — ~91.6% of theoretical BHET.

**LCA / TEA (WP4)**
- NAPCOR / APR, "Life Cycle Impacts for Postconsumer Recycled Resins: PET, HDPE, PP" **2018**. — virgin PET GWP ≈2.23 kg CO₂e/kg.
- APR, "Virgin vs. Recycled Plastic LCA" **2020**. — mechanical lower-impact; quality-degradation correction factors.
- Caraceni, F. et al. "Environmental Impacts of PET Chemical Recycling: A Case Study on Alkaline Hydrolysis and Systemic Evaluation." *ACS Sustainable Chem. Eng.* **2026**, 14(9), 4499–4509. DOI 10.1021/acssuschemeng.5c12048.

**Illustrative — no source (design choices, labelled as such in code)**
- Composite recyclability weights `wM`, `Mthresh`; decision-fusion `band.width`, `cut`; decision-stability
  tier constants + noise floor; absolute cost figures; PURITY coefficients.

---

## 5. Sample record (BigSMILES; optional PolyDAT-compatible export)

PRISMatic's own record models the sample as a transformation network: **virgin PET → mechanically
degraded state (at the inferred cycle) → glycolysis monomer (BHET)**, with species given as BigSMILES.
The optional export in the PolyDAT community format (Lin et al., *J. Chem. Inf. Model.* 2021, 61,
1150–1163, DOI 10.1021/acs.jcim.1c00028) serialises the same network with UO ontology unit codes
(e.g. Mₙ = UO_0000088, ratios = UO_0000186). This mirrors the planned WP3 database model; operators
never edit JSON. All values are computed from the illustrative model and every record is self-labelled
as such.

---

## 6. Unified mechanical model `MECH(n)`

The mechanical-profile and valorisation models (§6–§7) follow the same rules as above: all parameters
live in the model section of `prismatic.html` and remain **illustrative placeholders**. The
spectral→mechanical library is **virtual/synthetic**; the valorisation carbon/cost figures are
**illustrative cradle-to-gate**, not a validated LCA/TEA. Real WP1 D1.3 rows and WP4 LCA/TEA drop into
the same structures verbatim.

`MECH(n)` is a single source of truth driven by the inferred state `n` (+ band `dn`). `uts:=TS(n)` and
`eb:=EB(n)` verbatim, so the degradation chart and the mechanical profile agree. A shared **ductility
factor** `D(n)=clamp((EB(n)−eb.lim)/(V.eb−eb.lim),0,1)` (1→0) makes embrittlement structural.

| Property | Form | Virgin → n=10 | Basis |
|---|---|---|---|
| Young's modulus E | `2.75·(1+0.12·(1−D))` GPa | 2.75 → 3.08 (**rises**) | chemi-crystallisation stiffens as it embrittles; unfilled PET ~2.7–3.1 GPa |
| Yield stress | `58−16·(1−D)` MPa | 58 → 42 (moderate) | virgin yield 55–60 MPa; upper-yield peak (yield-drop) |
| UTS | `= TS(n)` | 49.5 → 29.7 | degradation sigmoid (read as ultimate/plateau stress) |
| Elongation at break | `= EB(n)` | 273 → 8 % | degradation sigmoid (collapses earliest) |
| Notched Izod impact | `12+78·sig(n,2.8,0.9)` J/m | 87 → 12 (**sharp collapse**, leads EB) | unfilled PET 43–85 J/m; notch-sensitive embrittlement |
| Toughness | area ∫σ dε of `stressStrain(n)` | ≈140 → 3 MJ/m³ (~48×) | derived, collapses with EB/impact |

Each property carries a ±band from evaluating at `n±dn` (reuses the B-PINN-style band; no new uncertainty
model). Monotonicity: **E rises; yield, UTS, EB, impact, toughness fall; impact & toughness collapse
together with EB.** Reconciliation note surfaced in-tool: coded "TS" is read as UTS; yield (≈58)
exceeds the drawn plateau (≈50) — the yield-drop characteristic of semicrystalline PET.

**Stress–strain synthesis `stressStrain(n)`** — elastic slope = E to yield, then (ductile) plateau →
strain-hardening → high-strain break, morphing via `D` to a near-linear brittle early fracture. Toughness
is the trapezoidal area of these exact plotted points, so the on-screen toughness % **equals the shaded
area under the plotted curve** by construction (100/94/56/13/3/2 % of virgin at n=0/1/3/5/7/10).

**Virtual library `LIB`** — 10 synthetic rows `{n_equiv, spectral{ci,cooh,nir}, mech{6 props}}`, each equal
to the models at `n_equiv`; round-trips through `inferState` (rows 0/3/5/7/9 → n≈0.00/3.00/5.01/6.98/9.97).
Labelled **VIRTUAL — WP1 D1.3; real rows replace verbatim.**

## 7. End-use valorisation

**Oxidation→yellowness proxy** `Y(n)=0.75·CInorm+0.25·COOHnorm` ∈[0,1] (from existing CI/COOH; no new
state). Gates clarity markets earlier than IV alone (food `Y≤0.15`, sheet `Y≤0.35`).

**Application gates** (illustrative): food-grade bottle IV≥0.72 + clarity + near-virgin-mech OR chemical;
sheet IV≥0.65 + looser clarity; fibre IV≥0.55; strapping IV≥0.80; injection IV≥0.62; downcycle IV≥0.40;
energy last resort. A **minimum-toughness** mechanical-acceptability gate closes fibre/injection at high
embrittlement. This is needed because the IV asymptote (0.58) never drops below the fibre floor, so the
value cascade is driven by toughness collapse — the more physical criterion in any case.

**Carbon (kg CO₂e/kg, cradle-to-gate, illustrative):** virgin baseline **2.15**; mech flake ≈0.45; food-grade
mech pellet ≈0.90; chemical (glycolysis+repoly) ≈1.60; + per-product conversion (bottle 0.30, sheet 0.25,
fibre 0.35, strapping 0.20, injection 0.30, downcycle 0.15). Avoided = virgin-product − route-product.
**Cost/value (£/kg, illustrative):** virgin 1.20; flake 0.90; food-grade pellet 1.50; chem 2.00; downcycle 0.35.

**Route logic:** mech/hybrid → value cascade on current predicted properties (IV + MECH + Y); chemical →
depolymerise→BHET→repolymerise resets to virgin-equivalent, reopening **all** markets incl. food-grade, but
at the chemical route's higher carbon/cost. Honest tension surfaced: mechanical is lower-carbon but only
while the material still qualifies; chemical reopens the top of the cascade at a carbon/cost premium.

## 8. Citations for §6–§7 (sources checked 1 July 2026; DOIs re-verified 30 September 2026)
- MakeItFrom, *PET (PETE)* — unfilled modulus/UTS/Izod/EB ranges.
- Gonçalves Marques et al., *Effect of Mechanical Recycling on Structural Modification and Mechanical Behavior of PET*, **Ind. Eng. Chem. Res.** 2025, DOI 10.1021/acs.iecr.4c03818 — yield/UTS decline, ductile→brittle, notch sensitivity.
- Ronkay et al., **Macromol. Mater. Eng.** 2025, DOI 10.1002/mame.202400219 — EB embrittles earliest.
- Straková et al., **Polymers** 2026, DOI 10.3390/polym18030416 — chemi-crystallisation (crystallinity ≈23→29.5 %) with reprocessing.
- Slezák et al., *Development of an engineering material with increased impact strength and heat resistance from recycled PET*, **J. Polym. Environ.** 2023, DOI 10.1007/s10924-023-02945-4 — impact / glass-fill context.
- Slezák et al., *Heliyon* 2024, PMC11168396 — EB collapses earliest with reprocessing.
- FindOutAboutPlastics 2025 & PolymerCircle — application IV grade bands (fibre 0.55–0.70, sheet 0.70–0.80, bottle 0.72–0.85, strapping 0.80+).
- ALPLA/PET Recycling Team (virgin ≈2.15, rPET flake ≈0.45 kg CO₂e/kg); APR *Recycled vs Virgin LCA* 2020.
- PMC11205646 (glycolysis GWP 0.4–1.9 kg CO₂e/kg); Muangmeesri et al., ACS Sustainable Chem. Eng. 2024, DOI 10.1021/acssuschemeng.3c07435 (methanolysis LCA).
- Straková et al., **Polymers** 2026, DOI 10.3390/polym18030416 — systematic darkening with reprocessing; CIELAB L* correlates with IV (supports a colour gate tied to degradation).
- rPET pricing: ICIS R-PET; ChemAnalyst; BusinessAnalytiq food-grade rPET index (2024–25).

**Illustrative — no source (labelled in code):** `D(n)` construction; E0/kE (2.75/0.12); yield YS0/kY (58/16);
impact IMP0/floor/nc/w (90/12/2.8/0.9); stress–strain control-point fractions & target toughness magnitudes;
yellowness weights (0.75/0.25) & gates (0.15/0.35); all £/kg values, carbon conversions, RESIN footprints;
`minToughness` gates; BHET food purity floor 0.88; the whole `LIB` grid (VIRTUAL pending WP1 D1.3).

---

## 9. Synthetic spectrum view (input visualisation)

The Sample-input panel renders a **synthetic ATR-FTIR + NIR spectrum** generated directly from the three
slider values (pre-inference), so "reads the spectral fingerprint" is visible rather than implied. It is a
sum of Gaussian bands over a deterministic baseline; **no measured spectrum is drawn** and the trace feeds
nothing — inference still consumes only the three slider values.

- **Band positions are the standard PET assignments** (mid-IR: 1715 ester C=O; ~1685 carboxyl/acid
  shoulder; 1614/1578/1505 ring; 1410 ring — the CI reference band; 1340 CH₂ wag; 1245 and 1095–1120 C–O;
  1017 ring; 970; 872/845; 727 ring out-of-plane. NIR: C–H first overtone ~5800 cm⁻¹ as the fixed
  reference band; combination band ~4620 cm⁻¹ as the growing marker).
- **Band widths and amplitudes are illustrative — no source.** The ester C=O amplitude grows and broadens
  with the CI slider; the ~1685 shoulder grows with the COOH slider; the ~4620 NIR band grows with the NIR
  slider against the fixed ~5800 reference (the drawn "band ratio").
- The panel is captioned as synthetic on-screen ("SYNTHETIC" watermark + hint text), consistent with the
  virtual-library chart.
