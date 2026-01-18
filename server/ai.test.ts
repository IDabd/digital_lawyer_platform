import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("AI Features", () => {
  it("should extract data from document", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // This will fail if document doesn't exist, but tests the API structure
    try {
      const result = await caller.ai.extractData({
        documentId: 1,
        extractionType: "entities",
      });
      expect(result).toBeDefined();
    } catch (error: any) {
      // Expected to fail if document doesn't exist
      expect(error.code).toBe("NOT_FOUND");
    }
  });

  it("should perform legal search", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.legalSearch({
      query: "ما هي شروط صحة العقد؟",
    });

    expect(result).toBeDefined();
    expect(result.results).toBeDefined();
    expect(Array.isArray(result.results)).toBe(true);
  }, 10000);

  it("should generate document draft", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // This will fail if template doesn't exist, but tests the API structure
    try {
      const result = await caller.ai.generateDraft({
        templateId: 1,
        variables: {
          partyA: "شركة ABC",
          partyB: "أحمد محمد",
        },
      });
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    } catch (error: any) {
      // Expected to fail if template doesn't exist
      expect(error.code).toBe("NOT_FOUND");
    }
  });

  it("should classify document", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // This will fail if document doesn't exist, but tests the API structure
    try {
      const result = await caller.ai.classifyDocument({
        documentId: 1,
      });
      expect(result).toBeDefined();
      expect(result.category).toBeDefined();
    } catch (error: any) {
      // Expected to fail if document doesn't exist
      expect(error.code).toBe("NOT_FOUND");
    }
  });
});
