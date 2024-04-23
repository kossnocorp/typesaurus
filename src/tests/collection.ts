import { describe, expect, it } from "vitest";
import { groups, schema } from "..";

describe("collection", () => {
  it("allows to name the collection", async () => {
    const db = schema(($) => ({
      schedule: $.collection<any, string>(),
      nope: $.collection<any, string>().name("schedule"),
    }));

    const id = Date.now().toString();

    await db.nope.set(id, { hello: "world" });
    const doc = await db.schedule.get(id);
    expect(doc?.data).toEqual({ hello: "world" });
  });

  it("renames nested collections", async () => {
    const db = schema(($) => ({
      schedule: $.collection<any, string>().sub({
        reminders: $.collection<any, string>(),
      }),
      nope: $.collection<any, string>()
        .name("schedule")
        .sub({
          nah: $.collection<any, string>().name("reminders"),
        }),
    }));

    const scheduleId = Math.random().toString();
    const reminderId = Math.random().toString();

    await db.nope(scheduleId).nah.set(reminderId, { hello: "world" });
    const doc = await db.schedule(scheduleId).reminders.get(reminderId);
    expect(doc?.data).toEqual({ hello: "world" });
  });

  it("exposes path and the name", async () => {
    const db = schema(($) => ({
      schedule: $.collection<any, string>().sub({
        nope: $.collection<any, string>().name("items"),
        executions: $.collection<any, string>(),
      }),
    }));

    const nope = db.schedule("schedule-id").nope;
    expect(nope.name).toEqual("items");
    expect(nope.path).toEqual("schedule/schedule-id/items");

    const executions = db.schedule("schedule-id").executions;
    expect(executions.name).toEqual("executions");
    expect(executions.path).toEqual("schedule/schedule-id/executions");
  });

  describe("as", () => {
    const db = schema(($) => ({
      schedule: $.collection<any, string>(),
      nope: $.collection<any, string>().name("schedule"),
    }));

    it("returns the collection", () => {
      const schedule = db.schedule.as();
      expect(schedule).toBe(db.schedule);
    });

    describe("groups", () => {
      it("returns the collection", () => {
        const group = groups(db).schedule;
        const schedule = group.as();
        expect(schedule).toBe(group);
      });
    });
  });
});
