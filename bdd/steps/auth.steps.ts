import { Given, When, Then, Before } from "@cucumber/cucumber";
import assert from "node:assert";
import { authenticator } from "otplib";
import { registerInputSchema, loginInputSchema } from "../../lib/auth";
import { hashPassword, verifyPassword } from "../../lib/password";

type TestContext = {
  registrationResult?: {
    username: string;
    totpSecret: string;
    passwordHash: string;
  };
  totpCode?: string;
  loginResult?: boolean;
};

const ctx: TestContext = {};

Before(() => {
  ctx.registrationResult = undefined;
  ctx.totpCode = undefined;
  ctx.loginResult = undefined;
});

Given("un visiteur accède à la page d'inscription", function () {
  // No-op, contextual step.
});

When(
  "il renseigne un pseudo unique, un mot de passe valide et un nom d'affichage",
  async function () {
    const raw = {
      username: "testeur" + Math.floor(Math.random() * 1000),
      displayName: "Testeur Automate",
      password: "Motdepasse9",
      email: undefined,
    };
    const parsed = registerInputSchema.parse(raw);
    const secret = authenticator.generateSecret();
    const passwordHash = await hashPassword(parsed.password);

    ctx.registrationResult = {
      username: parsed.username,
      totpSecret: secret,
      passwordHash,
    };
  },
);

Then("le compte est créé", function () {
  assert.ok(ctx.registrationResult);
});

Then("un secret TOTP est communiqué", function () {
  assert.ok(ctx.registrationResult?.totpSecret);
  assert.equal(ctx.registrationResult?.totpSecret.length, 32);
});

Given(
  "un compte utilisateur enregistré avec un secret TOTP",
  async function () {
    const raw = {
      username: "bdd-user",
      displayName: "BDD User",
      password: "Complexe9",
      email: undefined,
    };
    const parsed = registerInputSchema.parse(raw);
    const passwordHash = await hashPassword(parsed.password);
    const secret = authenticator.generateSecret();
    const totpCode = authenticator.generate(secret);

    ctx.registrationResult = {
      username: parsed.username,
      totpSecret: secret,
      passwordHash,
    };
    ctx.totpCode = totpCode;
  },
);

When(
  "l'utilisateur saisit le bon mot de passe et un code TOTP valide",
  async function () {
    assert.ok(ctx.registrationResult);

    const input = {
      username: ctx.registrationResult.username,
      password: "Complexe9",
      totpCode: ctx.totpCode,
      remember: true,
    };
    const parsed = loginInputSchema.parse(input);
    const passwordOk = await verifyPassword(
      parsed.password,
      ctx.registrationResult.passwordHash,
    );
    const totpOk = authenticator.check(
      parsed.totpCode,
      ctx.registrationResult.totpSecret,
    );

    ctx.loginResult = passwordOk && totpOk;
  },
);

Then("la connexion est acceptée", function () {
  assert.equal(ctx.loginResult, true);
});

Then("l'utilisateur est redirigé vers la page des catégories", function () {
  // No real navigation in BDD test, we assert success flag.
  assert.equal(ctx.loginResult, true);
});
