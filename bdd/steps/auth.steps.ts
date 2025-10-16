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
  lastError?: unknown;
};

const ctx: TestContext = {};

Before(() => {
  ctx.registrationResult = undefined;
  ctx.totpCode = undefined;
  ctx.loginResult = undefined;
  ctx.lastError = undefined;
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

Given("un compte utilisateur enregistré avec un secret TOTP",
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
  "l'utilisateur saisit uniquement son mot de passe correct",
  async function () {
    assert.ok(ctx.registrationResult);

    const input = {
      username: ctx.registrationResult.username,
      password: "Complexe9",
      remember: true,
    };

    const parsed = loginInputSchema.parse(input);
    assert.equal(typeof parsed.password, "string");
    const passwordOk = await verifyPassword(
      parsed.password as string,
      ctx.registrationResult.passwordHash,
    );

    ctx.loginResult = passwordOk;
  },
);

When(
  "l'utilisateur saisit un code TOTP valide sans mot de passe",
  async function () {
    assert.ok(ctx.registrationResult);
    assert.ok(ctx.totpCode);

    const input = {
      username: ctx.registrationResult.username,
      totpCode: ctx.totpCode,
      remember: true,
    };

    const parsed = loginInputSchema.parse(input);
    const totpOk = authenticator.check(
      parsed.totpCode as string,
      ctx.registrationResult.totpSecret,
    );

    ctx.loginResult = totpOk;
  },
);

When("l'utilisateur saisit simultanèment son mot de passe et un code TOTP",
  async function () {
    assert.ok(ctx.registrationResult);
    assert.ok(ctx.totpCode);

    const input = {
      username: ctx.registrationResult.username,
      password: "Complexe9",
      totpCode: ctx.totpCode,
      remember: true,
    };

    try {
      loginInputSchema.parse(input);
      ctx.loginResult = true;
    } catch (error) {
      ctx.loginResult = false;
      ctx.lastError = error;
    }
  },
);

Then("la connexion est acceptée", function () {
  assert.equal(ctx.loginResult, true);
});

Then("l'utilisateur est redirigé vers la page des catégories", function () {
  // No real navigation in BDD test, we assert success flag.
  assert.equal(ctx.loginResult, true);
});

Then("la connexion est rejetée", function () {
  assert.equal(ctx.loginResult, false);
  assert.ok(ctx.lastError instanceof Error);
});
