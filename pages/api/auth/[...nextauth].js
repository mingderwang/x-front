import NextAuth from "next-auth";

export default NextAuth({
  providers: [
    {
      id: "instagram",
      name: "instagram",
      type: "oauth",
      version: "2.0",
      token: {
        url: "https://api.instagram.com/oauth/access_token",
        async request({ client, params, checks, provider }) {
          const response = await client.oauthCallback(
            provider.callbackUrl,
            params,
            checks,
            {
              exchangeBody: {
                client_id: client.client_id,
                client_secret: client.client_secret,
              },
            }
          );
          console.log("response ====", response);
          return { tokens: response };
        },
      },
      authorization: {
        url: "https://api.instagram.com/oauth/authorize",
        params: {
          scope: "user_profile",
        },
      },
      userinfo: {
        url: "https://graph.instagram.com/me?fields=id, username, account_type, media_count, media",
        async request({ client, tokens }) {
          // Get base profile
          console.log("client", client);
          console.log("tokens", tokens);
          const profile = await client.userinfo(tokens);
          // no email info from Pinterest API
          if (!profile.email) {
            profile.email = profile.username;
          }
          return profile;
        },
      },
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,

      profile(profile, accessToken) {
        console.log("token", accessToken);
        console.log("profile", profile);
        return {
          id: profile.id,
          name: profile.account_type,
          email: profile.email,
          image: profile.media_count,
        };
      },
      checks: "none",
      headers: {},
      authorizationParams: {
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        redirect_uri: encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI),
      },
    },
    {
      id: "pinterest",
      name: "Pinterest",
      type: "oauth",
      version: "2.0",
      token: "https://api.pinterest.com/v5/oauth/token",
      authorization: {
        url: "https://www.pinterest.com/oauth",
        params: {
          audience: "api.pinterest.com",
          prompt: "consent",
          scope:
            "ads:read,boards:read,boards:read_secret,boards:write,boards:write_secret,pins:read,pins:read_secret,pins:write,pins:write_secret,user_accounts:read",
        },
      },
      userinfo: {
        url: "https://api.pinterest.com/v5/user_account",
        async request({ client, tokens }) {
          // Get base profile
          const profile = await client.userinfo(tokens);
          // no email info from Pinterest API
          if (!profile.email) {
            profile.email = profile.username;
          }
          return profile;
        },
      },
      clientId: process.env.PINTEREST_CLIENT_ID,
      clientSecret: process.env.PINTEREST_CLIENT_SECRET,

      profile(profile, accessToken) {
        console.log("accessToken", accessToken);
        console.log("profile", profile);
        return {
          id: profile.username,
          name: profile.username,
          email: profile.email,
          image: profile.profile_image,
        };
      },
      checks: "state",
      headers: {},
      authorizationParams: {
        client_id: process.env.PINTEREST_CLIENT_ID,
        redirect_uri: encodeURIComponent(process.env.PINTEREST_REDIRECT_URI),
      },
    },
  ],
  secret: process.env.SECRET,

  session: {
    strategy: "jwt",
  },

  jwt: {},

  pages: {},

  callbacks: {},

  events: {},

  theme: {
    colorScheme: "light",
  },

  debug: false,
});
