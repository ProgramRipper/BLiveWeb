import md5 from "md5";

(() => {
  const fetch = window.fetch;
  const open = XMLHttpRequest.prototype.open;
  const responseText = Object.getOwnPropertyDescriptor(
    XMLHttpRequest.prototype,
    "responseText",
  )!.get! as () => string;

  let roomid: string;

  XMLHttpRequest.prototype.open = function (
    this: XMLHttpRequest,
    method: string,
    url: string,
    async: boolean = true,
    user: string | null = null,
    password: string | null = null,
  ) {
    const { host, pathname, searchParams } = new URL(
      url.startsWith("//") ? "https:" + url : url,
    );

    switch ([method, host, pathname].toString()) {
      case [
        "GET",
        "api.live.bilibili.com",
        "/room/v1/Area/getMyChooseArea",
      ].toString():
        roomid = searchParams.get("roomid")!;
        break;

      case [
        "GET",
        "api.live.bilibili.com",
        "/xlive/app-blink/v1/live/GetWebLivePermission",
      ].toString():
        Object.defineProperty(this, "responseText", {
          get() {
            const resp = JSON.parse(responseText.call(this));
            if (resp.data.allow_live) XMLHttpRequest.prototype.open = open;
            else resp.data.allow_live = true;
            return JSON.stringify(resp);
          },
        });
        break;

      case [
        "POST",
        "api.live.bilibili.com",
        "/xlive/app-blink/v1/live/FetchWebUpStreamAddr",
      ].toString():
        this.send = async () => {
          const body = await (
            await fetch(
              `https://api.live.bilibili.com/live_stream/v1/StreamList/get_stream_by_roomId?room_id=${roomid}`,
              { mode: "cors", credentials: "include" },
            )
          ).json();

          body.data.addr = body.data.rtmp;
          body.data.line = body.data.stream_line;
          delete body.data.rtmp;
          delete body.data.stream_line;

          Object.defineProperties(this, {
            readyState: { value: 4 },
            status: { value: 200 },
            responseText: { value: JSON.stringify(body) },
          });
          this.dispatchEvent(new Event("load"));
          this.dispatchEvent(new Event("readystatechange"));
        };
        break;
    }

    open.call(this, method, url, async, user, password);
  };

  (unsafeWindow || window).fetch = (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof Request
          ? input.url
          : input.toString();
    const { host, pathname, searchParams } = new URL(
      url.startsWith("//") ? "https:" + url : url,
    );

    switch ([init?.method ?? "GET", host, pathname].toString()) {
      case [
        "POST",
        "api.live.bilibili.com",
        "/xlive/app-blink/v1/streaming/WebLiveCenterStartLive",
      ].toString():
        const body = new URLSearchParams({
          access_key: "",
          appkey: "aae92bc66f3edfab",
          area_v2: searchParams.get("area_v2") ?? "",
          build: "9343",
          csrf: searchParams.get("csrf") ?? "",
          csrf_token: searchParams.get("csrf_token") ?? "",
          platform: "pc_link",
          room_id: searchParams.get("room_id") ?? "",
          ts: Math.floor(Date.now() / 1000).toString(),
        });
        body.sort();
        body.set(
          "sign",
          md5(body.toString() + "af125a0d5279fd576c1b4418a3e8276d"),
        );

        return fetch("https://api.live.bilibili.com/room/v1/Room/startLive", {
          body,
          method: "POST",
          mode: "cors",
          credentials: "include",
        });
    }

    return fetch(input, init);
  };
})();
