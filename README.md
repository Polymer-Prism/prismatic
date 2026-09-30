# PRISMatic

**A decision demonstrator for recycling post-consumer PET of unknown history.**

PRISMatic is the proof-of-concept demonstrator for **PRISM** (Physics-Informed Recyclability
Identification through Spectroscopic and Mechanical Modelling), work package 3. It reads the ATR-FTIR/NIR spectral fingerprint of a PET sample, infers how
degraded the material is, predicts its mechanical properties, and recommends whether it should be
**mechanically recycled, chemically recycled, or handled by a hybrid route**.

Developed by **Oana Istrate** and **Peter Nockemann**, Queen's University Belfast (2026).

> [!IMPORTANT]
> **This is an illustrative demonstrator.** Every parameter and prediction is a literature-scaled
> placeholder, and the inference is an *emulation* of the planned physics-enforced neural network, not a
> trained model. It shows the decision architecture and interface; it reports no measured or validated
> results. This is labelled throughout the tool and in every exported file.

## Try it

**Open it online: <https://polymer-prism.github.io/prismatic/>**

Or download [`prismatic.html`](prismatic.html) and open it in any modern browser. It is a single,
self-contained file: no installation, no network connection, no external libraries.

Then:

1. Press **▶ Take the 2-minute tour** for a guided walk through the decision chain.
2. Try the three example scenarios under the tour button (near-virgin, boundary case, heavily degraded).
3. Move the spectral sliders and the criterion weights, and watch the recommendation respond.

## How it works

```
spectral fingerprint  →  inferred degradation state  →  three transition criteria  →  recommended route
(carbonyl index,         (reprocessing-cycle            technical   (WP1)            mechanical /
 carboxyl endgroups,      equivalent ± uncertainty;     chemical    (WP2)            hybrid /
 NIR ratio)               no cycle count needed)        sustainability (WP4)         chemical
```

From the same inferred state, PRISMatic also shows:

- **Predicted mechanical profile:** a synthesised stress–strain curve against virgin PET, and six
  properties as a percentage of virgin, with uncertainty bands.
- **End-use valorisation:** which PET markets the material can still serve, with illustrative carbon and
  value estimates.
- **Robustness:** how the recommendation changes as the sustainability weighting is varied.
- **Sample record:** a structured record of inputs, predictions and decision, exportable as JSON.

## What is real and what is emulated

| Carries into the deployed tool | Placeholder until the project delivers it |
|---|---|
| The decision architecture: fingerprint → state → fusion of three criteria → route | Every number: curve parameters, thresholds, crossovers, LCA/TEA values, yields |
| Physics-informed functional forms (chain-scission decay, sigmoidal mechanical loss, saturating oxidation) | The inference: a transparent rule-based stand-in for the physics-enforced neural network (PENN) |
| Uncertainty logic: lower decision stability near route boundaries | Decision-stability figures (heuristic, not calibrated) |
| The sample-record data model | The spectral→mechanical reference library (virtual, generated from the model) |

All placeholder values sit in one constant block (`PET`) so that fitted parameters and a trained model can
replace them without changing the interface. [`SCIENCE_NOTES.md`](SCIENCE_NOTES.md) documents every
functional form, parameter and literature source.

## Repository contents

| File | Contents |
|---|---|
| [`prismatic.html`](prismatic.html) | The demonstrator (single offline file) |
| [`index.html`](index.html) | Forwards the website address to the demonstrator |
| [`SCIENCE_NOTES.md`](SCIENCE_NOTES.md) | Functional forms, parameter table, assumptions and citations |
| [`PROVENANCE.md`](PROVENANCE.md) | Authorship, dated record, what PRISM contributes, citation policy |
| [`CITATION.cff`](CITATION.cff) | Machine-readable citation metadata |
| [`LICENSE`](LICENSE) | Evaluation-only licence |
| [`tests/export-consistency.cjs`](tests/export-consistency.cjs) | Regression checks for the model and exports |

## Exports and reproducibility

The **Sample record** drawer offers two JSON exports; the assessment can also be exported as an image.

- **PRISM JSON** is PRISMatic's native record (format `PRISM-record/2.0`). It keeps the exact input
  fingerprint and criterion weights separate from the model's predictions, and records the app and model
  versions (`1.2.0`, `PET-illustrative/1.0`) and a UTC timestamp, so an assessment can be replayed.
- **PolyDAT-compatible JSON** is an optional export in the PolyDAT community format (Lin et al.,
  *J. Chem. Inf. Model.* 2021, 61, 1150–1163) for data exchange. It embeds the native record.

**Copy link** produces a URL that restores the exact slider settings.

## Tests

With Node.js installed, from the repository root:

```sh
node tests/export-consistency.cjs
```

The checks load the model directly from `prismatic.html`. They confirm that exports preserve the exact
inputs, that assessments can be replayed from an exported record, and that the headline, market ranking,
JSON and image snapshot agree for mechanical, hybrid and chemical cases.

## Citation

Please cite PRISMatic using the metadata in [`CITATION.cff`](CITATION.cff) (GitHub's **Cite this
repository** button formats it for you).

## Licence

Copyright © 2026 Oana M. Istrate and Peter Nockemann. All rights reserved. PRISMatic may be viewed, run
and cited for evaluation, including peer review; any other use requires written permission. See
[`LICENSE`](LICENSE).

## Authors

- **Dr Oana M. Istrate MRSC** (lead author), Senior Lecturer, School of Mechanical and Aerospace
  Engineering, Queen's University Belfast · ORCID [0000-0002-6025-3320](https://orcid.org/0000-0002-6025-3320)
- **Prof. Peter Nockemann FRSC**, Chair in Inorganic Chemistry, School of Chemistry and Chemical
  Engineering and The QUILL Research Centre, Queen's University Belfast · ORCID
  [0000-0001-9864-9702](https://orcid.org/0000-0001-9864-9702)

**Contact:** Dr Oana M. Istrate, [o.istrate@qub.ac.uk](mailto:o.istrate@qub.ac.uk) ·
[go.qub.ac.uk/oanaistrate](https://go.qub.ac.uk/oanaistrate)
