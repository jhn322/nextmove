import { createClient } from "@supabase/supabase-js";
import type { Adapter, AdapterAccount, AdapterUser } from "next-auth/adapters";

export function CustomSupabaseAdapter(options: {
  url: string;
  secret: string;
}): Adapter {
  const { url, secret } = options;
  const supabase = createClient(url, secret, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const getUser = async (id: string) => {
    try {
      console.log("[supabase-adapter] getUser called with id:", id);
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("id", id)
        .single();

      if (error) {
        console.error("[supabase-adapter] getUser error:", error);
        return null;
      }

      console.log("[supabase-adapter] getUser result:", data);
      return data as AdapterUser | null;
    } catch (error) {
      console.error("[supabase-adapter] getUser exception:", error);
      return null;
    }
  };

  const getUserByEmail = async (email: string) => {
    try {
      console.log(
        "[supabase-adapter] getUserByEmail called with email:",
        email
      );
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("email", email)
        .single();

      if (error) {
        console.error("[supabase-adapter] getUserByEmail error:", error);
        return null;
      }

      console.log("[supabase-adapter] getUserByEmail result:", data);
      return data as AdapterUser | null;
    } catch (error) {
      console.error("[supabase-adapter] getUserByEmail exception:", error);
      return null;
    }
  };

  const getUserByAccount = async ({
    providerAccountId,
    provider,
  }: {
    providerAccountId: string;
    provider: string;
  }) => {
    try {
      console.log("[supabase-adapter] getUserByAccount called with:", {
        providerAccountId,
        provider,
      });
      const { data, error } = await supabase
        .from("accounts")
        .select("user_id")
        .eq("provider_account_id", providerAccountId)
        .eq("provider", provider)
        .single();

      if (error) {
        console.error("[supabase-adapter] getUserByAccount error:", error);
        return null;
      }

      if (!data?.user_id) {
        console.error("[supabase-adapter] getUserByAccount: No user_id found");
        return null;
      }

      console.log(
        "[supabase-adapter] getUserByAccount found user_id:",
        data.user_id
      );
      return getUser(data.user_id);
    } catch (error) {
      console.error("[supabase-adapter] getUserByAccount exception:", error);
      return null;
    }
  };

  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      try {
        console.log("[supabase-adapter] createUser called with:", user);
        const { data, error } = await supabase
          .from("users")
          .insert({
            email: user.email,
            name: user.name,
            image: user.image,
            email_verified: user.emailVerified
              ? new Date(user.emailVerified).toISOString()
              : null,
          })
          .select()
          .single();

        if (error) {
          console.error("[supabase-adapter] createUser error:", error);
          throw error;
        }

        console.log("[supabase-adapter] createUser result:", data);
        return data as AdapterUser;
      } catch (error) {
        console.error("[supabase-adapter] createUser exception:", error);
        throw error;
      }
    },

    getUser,
    getUserByEmail,
    getUserByAccount,

    async updateUser(user: Partial<AdapterUser> & { id: string }) {
      try {
        console.log("[supabase-adapter] updateUser called with:", user);
        const { data, error } = await supabase
          .from("users")
          .update({
            name: user.name,
            email: user.email,
            image: user.image,
            email_verified: user.emailVerified
              ? new Date(user.emailVerified).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
          .select()
          .single();

        if (error) {
          console.error("[supabase-adapter] updateUser error:", error);
          throw error;
        }

        console.log("[supabase-adapter] updateUser result:", data);
        return data as AdapterUser;
      } catch (error) {
        console.error("[supabase-adapter] updateUser exception:", error);
        throw error;
      }
    },

    async deleteUser(userId: string) {
      try {
        console.log(
          "[supabase-adapter] deleteUser called with userId:",
          userId
        );
        const { error } = await supabase
          .from("users")
          .delete()
          .eq("id", userId);

        if (error) {
          console.error("[supabase-adapter] deleteUser error:", error);
          throw error;
        }

        console.log("[supabase-adapter] deleteUser successful");
      } catch (error) {
        console.error("[supabase-adapter] deleteUser exception:", error);
        throw error;
      }
    },

    async linkAccount(account: AdapterAccount) {
      try {
        console.log("[supabase-adapter] linkAccount called with:", account);
        const { error } = await supabase.from("accounts").insert({
          user_id: account.userId,
          type: account.type,
          provider: account.provider,
          provider_account_id: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        });

        if (error) {
          console.error("[supabase-adapter] linkAccount error:", error);
          throw error;
        }

        console.log("[supabase-adapter] linkAccount successful");
      } catch (error) {
        console.error("[supabase-adapter] linkAccount exception:", error);
        throw error;
      }
    },

    async unlinkAccount({
      providerAccountId,
      provider,
    }: {
      providerAccountId: string;
      provider: string;
    }) {
      try {
        console.log("[supabase-adapter] unlinkAccount called with:", {
          providerAccountId,
          provider,
        });
        const { error } = await supabase
          .from("accounts")
          .delete()
          .eq("provider_account_id", providerAccountId)
          .eq("provider", provider);

        if (error) {
          console.error("[supabase-adapter] unlinkAccount error:", error);
          throw error;
        }

        console.log("[supabase-adapter] unlinkAccount successful");
      } catch (error) {
        console.error("[supabase-adapter] unlinkAccount exception:", error);
        throw error;
      }
    },

    async createSession({
      sessionToken,
      userId,
      expires,
    }: {
      sessionToken: string;
      userId: string;
      expires: Date;
    }) {
      try {
        console.log("[supabase-adapter] createSession called with:", {
          sessionToken,
          userId,
          expires: expires.toISOString(),
        });

        // Convert Date to ISO string for Supabase
        const expiresAt = expires.toISOString();

        const { data, error } = await supabase
          .from("sessions")
          .insert({
            user_id: userId,
            expires: expiresAt,
            session_token: sessionToken,
          })
          .select()
          .single();

        if (error) {
          console.error("[supabase-adapter] createSession error:", error);
          throw error;
        }

        console.log("[supabase-adapter] createSession result:", data);
        return {
          ...data,
          expires: new Date(data.expires),
        };
      } catch (error) {
        console.error("[supabase-adapter] createSession exception:", error);
        throw error;
      }
    },

    async getSessionAndUser(sessionToken: string) {
      try {
        console.log(
          "[supabase-adapter] getSessionAndUser called with sessionToken:",
          sessionToken ? "exists" : "undefined"
        );

        if (!sessionToken) {
          console.error(
            "[supabase-adapter] getSessionAndUser called with undefined sessionToken"
          );
          return null;
        }

        // First try to get the session
        const { data: session, error } = await supabase
          .from("sessions")
          .select("*")
          .eq("session_token", sessionToken)
          .single();

        if (error) {
          console.error("[supabase-adapter] Error fetching session:", error);
          return null;
        }

        if (!session) {
          console.error("[supabase-adapter] No session found for token");
          return null;
        }

        console.log("[supabase-adapter] Session found:", session);

        // Then get the user
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user_id)
          .single();

        if (userError) {
          console.error("[supabase-adapter] Error fetching user:", userError);
          return null;
        }

        if (!user) {
          console.error(
            "[supabase-adapter] No user found for session user_id:",
            session.user_id
          );
          return null;
        }

        console.log("[supabase-adapter] User found for session:", user);

        return {
          user,
          session: {
            id: session.id,
            sessionToken: session.session_token,
            userId: session.user_id,
            expires: new Date(session.expires),
          },
        };
      } catch (error) {
        console.error("[supabase-adapter] getSessionAndUser exception:", error);
        return null;
      }
    },

    async updateSession({
      sessionToken,
      expires,
    }: {
      sessionToken: string;
      expires?: Date;
    }) {
      try {
        console.log("[supabase-adapter] updateSession called with:", {
          sessionToken,
          expires: expires?.toISOString(),
        });

        const { data, error } = await supabase
          .from("sessions")
          .update({
            expires: expires ? expires.toISOString() : undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("session_token", sessionToken)
          .select()
          .single();

        if (error) {
          console.error("[supabase-adapter] updateSession error:", error);
          throw error;
        }

        console.log("[supabase-adapter] updateSession result:", data);
        return {
          ...data,
          expires: new Date(data.expires),
        };
      } catch (error) {
        console.error("[supabase-adapter] updateSession exception:", error);
        throw error;
      }
    },

    async deleteSession(sessionToken: string) {
      try {
        console.log(
          "[supabase-adapter] deleteSession called with sessionToken:",
          sessionToken
        );

        const { error } = await supabase
          .from("sessions")
          .delete()
          .eq("session_token", sessionToken);

        if (error) {
          console.error("[supabase-adapter] deleteSession error:", error);
          throw error;
        }

        console.log("[supabase-adapter] deleteSession successful");
      } catch (error) {
        console.error("[supabase-adapter] deleteSession exception:", error);
        throw error;
      }
    },

    async createVerificationToken({
      identifier,
      expires,
      token,
    }: {
      identifier: string;
      expires: Date;
      token: string;
    }) {
      try {
        console.log("[supabase-adapter] createVerificationToken called with:", {
          identifier,
          expires: expires.toISOString(),
          token,
        });

        const { data, error } = await supabase
          .from("verification_tokens")
          .insert({
            identifier,
            token,
            expires: expires.toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error(
            "[supabase-adapter] createVerificationToken error:",
            error
          );
          throw error;
        }

        console.log("[supabase-adapter] createVerificationToken result:", data);
        return {
          ...data,
          expires: new Date(data.expires),
        };
      } catch (error) {
        console.error(
          "[supabase-adapter] createVerificationToken exception:",
          error
        );
        throw error;
      }
    },

    async useVerificationToken({
      identifier,
      token,
    }: {
      identifier: string;
      token: string;
    }) {
      try {
        console.log("[supabase-adapter] useVerificationToken called with:", {
          identifier,
          token,
        });

        const { data, error } = await supabase
          .from("verification_tokens")
          .select()
          .eq("identifier", identifier)
          .eq("token", token)
          .single();

        if (error) {
          console.error(
            "[supabase-adapter] useVerificationToken error:",
            error
          );
          return null;
        }

        console.log(
          "[supabase-adapter] useVerificationToken found token:",
          data
        );

        await supabase
          .from("verification_tokens")
          .delete()
          .eq("identifier", identifier)
          .eq("token", token);

        console.log("[supabase-adapter] useVerificationToken deleted token");

        return {
          ...data,
          expires: new Date(data.expires),
        };
      } catch (error) {
        console.error(
          "[supabase-adapter] useVerificationToken exception:",
          error
        );
        return null;
      }
    },
  };
}
