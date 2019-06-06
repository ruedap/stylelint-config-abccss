import config from "../";
import stylelint from "stylelint";
import test from "ava";

const validCss = `.selector-x { width: 10%; }
.selector-y { width: 20%; }
.selector-z { width: 30%; }
`;

const invalidCss = `.foo {
  color: #fff;
  top: .2em;
}
`;

test("stylelint runs with config", t => {
  return stylelint
    .lint({
      code: "a { font-weight: bold; }",
      config: config
    })
    .then(data => {
      t.truthy(true, "config works");
      t.truthy(data, "data exists");
    });
});

test("no warnings with valid css", t => {
  return stylelint
    .lint({
      code: validCss,
      config: config
    })
    .then(data => {
      const { errored, results } = data;
      const { warnings } = results[0];
      t.falsy(errored, "no errored");
      t.is(warnings.length, 0, "flags no warnings");
    });
});

test("a warning with invalid css", t => {
  return stylelint
    .lint({
      code: invalidCss,
      config: config
    })
    .then(data => {
      const { errored, results } = data;
      const { warnings } = results[0];
      t.truthy(errored, "errored");
      t.is(warnings.length, 2, "flags two warning");
      t.is(
        warnings[0].text.trim(),
        'Expected "top" to come before "color" (order/properties-order)',
        "correct warning text"
      );
      t.is(
        warnings[1].text,
        "Expected a leading zero (number-leading-zero)",
        "correct warning text"
      );
    });
});

test("no deprecated config", t => {
  return stylelint
    .lint({
      code: "",
      config: config,
      syntax: "scss"
    })
    .then(data => {
      const { errored, results } = data;
      t.falsy(errored, "errored");
      t.not(results.length, 0, "did not find any results");
      t.is(results[0].deprecations.length, 0);
    });
});

test("no-duplicate-dollar-variables rule", t => {
  const invalidCss = `
$a: 1;
$a: 2;
`;
  return stylelint
    .lint({
      code: invalidCss,
      config: config
    })
    .then(data => {
      const { errored, results } = data;
      const { warnings } = results[0];
      t.falsy(errored);
      t.is(warnings.length, 0);
    });
});

test("value-keyword-case (valid)", t => {
  const _valid = `
unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
  U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
  U+FEFF, U+FFFD;
`;
  return stylelint
    .lint({
      code: _valid,
      config: config
    })
    .then(data => {
      const { errored, results } = data;
      const { warnings } = results[0];
      t.falsy(errored);
      t.is(warnings.length, 0);
    });
});

test("value-keyword-case (invalid)", t => {
  const _invalid = `
display: FLEX;
`;
  return stylelint
    .lint({
      code: _invalid,
      config: config
    })
    .then(data => {
      const { errored, results } = data;
      const { warnings } = results[0];
      t.truthy(errored);
      t.is(warnings.length, 1);
      t.is(
        warnings[0].text,
        `Expected "FLEX" to be "flex" (value-keyword-case)`
      );
    });
});
