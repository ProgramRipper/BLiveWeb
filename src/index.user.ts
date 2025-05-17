(() => {
  const originOpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function (
    this: XMLHttpRequest,
    method: string,
    url: string,
    async: boolean = true,
    user: string | null = null,
    password: string | null = null,
  ) {
    const { host, pathname } = new URL(
      url.startsWith("//") ? "https:" + url : url,
    );

    switch (method) {
      case "GET":
        if (
          host === "api.live.bilibili.com" &&
          pathname === "/xlive/app-blink/v1/live/GetWebLivePermission"
        ) {
          const getter = Object.getOwnPropertyDescriptor(
            XMLHttpRequest.prototype,
            "responseText",
          )?.get;

          Object.defineProperty(this, "responseText", {
            get() {
              const resp = JSON.parse(getter?.call(this));
              resp.data.allow_live = true;
              return JSON.stringify(resp);
            },
          });
        }

        break;
      case "POST":
        if (
          host === "api.live.bilibili.com" &&
          pathname === "/room/v1/Room/startLive"
        ) {
          this.send = (body: string) => {
            const searchParams = new URLSearchParams(body);

            searchParams.set("platform", "ios");
            XMLHttpRequest.prototype.send.call(this, searchParams.toString());
          };
        }

        break;
    }

    originOpen.call(this, method, url, async, user, password);
  };
})();
