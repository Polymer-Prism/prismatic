// Run with: node tests/export-consistency.cjs (no dependencies).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'prismatic.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script); // Check the complete shipped script, including event wiring.
const context = vm.createContext({assert, document: {getElementById: () => null}});
// Load the actual application model/export functions without attaching browser events.
vm.runInContext(script.split('/* ---------- events ---------- */')[0], context);
vm.runInContext(`
  const close = (a,b) => assert.ok(Math.abs(a-b)<1e-10, a+' != '+b);
  const defaultResult = recompute();
  const record = buildPrismRecord(defaultResult);
  assert.equal(record.format, 'PRISM-record/2.0');
  assert.equal(record.tool_version, APP_VERSION);
  assert.equal(record.model_version, MODEL_VERSION);
  assert.equal(record.spectral_fingerprint.carbonyl_index, 0.30);
  assert.equal(record.spectral_fingerprint.carboxyl_endgroups_eq_per_1e6g, 85);
  assert.equal(record.spectral_fingerprint.nir_iv_proxy, 0.55);
  assert.notDeepEqual(record.spectral_fingerprint, record.predicted.spectral_fingerprint);
  assert.equal(record.valorisation.virgin_product_carbon_kgCO2e_per_kg, 2.45);
  assert.equal(record.valorisation.carbon_kgCO2e_per_kg, 0.75);
  assert.equal(record.valorisation.carbon_saving_kgCO2e_per_kg_vs_virgin, 1.70);

  // Stored assessment inputs must not change when sliders/weights change later.
  state.ci=0.417123456789; state.cooh=100; state.nir=0.564321987654;
  state.W.t=0.8; state.W.s=0.1; state.W.c=0.3; state.lca='cost';
  assert.deepEqual(buildPrismRecord(defaultResult).spectral_fingerprint, record.spectral_fingerprint);
  assert.equal(buildPrismRecord(defaultResult).assessment_settings.criterion_weights.entered.technical, 0.4);
  const changed = recompute();
  latest=changed;
  assert.ok(pf_buildSnapshotSVG().includes('CI '+state.ci));
  assert.ok(pf_buildSnapshotSVG().includes('technical 0.8'));
  const exported = JSON.parse(JSON.stringify(buildPrismRecord(changed)));
  assert.equal(exported.spectral_fingerprint.carbonyl_index, state.ci);
  assert.equal(exported.spectral_fingerprint.nir_iv_proxy, state.nir);
  assert.equal(exported.assessment_settings.displayed_impact_metric, 'cost');
  const weights=exported.assessment_settings.criterion_weights;
  close(weights.normalised.technical, 2/3);
  assert.equal(weights.entered.technical, 0.8);
  assert.equal(weights.equal_weight_fallback, false);

  // Replay from exported inputs/weights without the original slider state.
  const input=exported.spectral_fingerprint;
  const replay=inferState({ci:input.carbonyl_index,cooh:input.carboxyl_endgroups_eq_per_1e6g,nir:input.nir_iv_proxy});
  close(replay.n, changed.inf.n); close(replay.dn, changed.inf.dn);
  const w=weights.normalised;
  close(scoreS(replay.n,{t:w.technical,s:w.sustainability,c:w.chemical}), changed.s);
  const poly=buildPolyDATExport(changed);
  assert.deepEqual(poly._prism_record.spectral_fingerprint, exported.spectral_fingerprint);
  assert.deepEqual(poly._prism_record.assessment_settings, exported.assessment_settings);
  assert.ok(poly.species[1].contents[0].characterization.ratios[0].method.includes('model reconstruction'));

  // All-zero weight handling must be explicit and reproducible.
  state.W={t:0,s:0,c:0};
  const zero=buildPrismRecord(recompute()).assessment_settings.criterion_weights;
  assert.equal(zero.equal_weight_fallback, true);
  close(zero.normalised.technical, 1/3);

  // Check all routes: headline, market row, JSON and image snapshot agree.
  state.W={t:0.4,s:0.35,c:0.25};
  const routes=new Set();
  for(const n of [0.5,4.5,8]){
    state.ci=CI(n); state.cooh=COOH(n);
    state.nir=(PET.iv.v0-IV(n))/(PET.iv.v0-PET.iv.lim);
    const result=recompute(), ev=evaluateEndUse(result), out=buildPrismRecord(result);
    routes.add(result.zone);
    const bestRow=ev.apps.find(app=>app.key===ev.best.key);
    close(ev.best.carbonVirgin, bestRow.carbonVirgin);
    close(ev.best.carbonVirgin-ev.best.carbon, ev.carbonSaving);
    close(out.valorisation.virgin_product_carbon_kgCO2e_per_kg-out.valorisation.carbon_kgCO2e_per_kg,
      out.valorisation.carbon_saving_kgCO2e_per_kg_vs_virgin);
    const comparison=ev.best.carbonVirgin.toFixed(2)+' → '+ev.best.carbon.toFixed(2);
    assert.ok(_vheadCard(ev,result.zone).includes(comparison));
    latest=result;
    assert.ok(pf_buildSnapshotSVG().includes(comparison+' kg CO2e/kg'));
  }
  assert.deepEqual([...routes].sort(), ['chem','hybrid','mech']);
`, context);
console.log('PASS: exact inputs, assessment snapshots, replay, both JSON exports, zero weights, and carbon consistency across all routes.');
