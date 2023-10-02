const originOpen = XMLHttpRequest.prototype.open

XMLHttpRequest.prototype.open = function (
  this: XMLHttpRequest,
  method: string,
  url: string,
  async: boolean = true,
  user: string | null = null,
  password: string | null = null
) {
  if (method === 'POST') {
    const { host, pathname } = new URL(url.startsWith('//') ? 'https:' + url : url)

    if (host === 'api.live.bilibili.com' && pathname === '/room/v1/Room/startLive') {
      this.send = (body: string) => {
        const searchParams = new URLSearchParams(body)

        searchParams.set('platform', 'ios')
        XMLHttpRequest.prototype.send.call(this, searchParams.toString())
      }
    }
  }

  originOpen.call(this, method, url, async, user, password)
}
