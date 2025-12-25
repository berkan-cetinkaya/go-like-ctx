import { background } from "go-like-ctx";

async function runWithTimeout() {
  const ctx = background().withTimeout(200);

  const task = async (name) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      ctx.throwIfCancelled();
      console.log(`${name}: completed`);
    } catch (err) {
      if (ctx.cancelled()) {
        console.log(`${name}: cancelled`);
        return;
      }
      throw err;
    }
  };

  await Promise.all([task("step1"), task("step2")]);
}

async function runWithValues() {
  const key = Symbol("request-id");
  const ctx = background().withValue(key, "req-123");
  const child = ctx.withCancel();

  console.log("value from child:", child.value(key));
  child.cancel();
  await child.done();
  console.log("child cancelled:", child.cancelled());
}

async function main() {
  console.log("timeout demo");
  await runWithTimeout();
  console.log("value demo");
  await runWithValues();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
