/* 
** 功能：使用 cloudflare 全球 CDN 加速下载文件
** 使用：
**   - 将代码拷贝到 cloudflare workers Script
**   - xxxxx.xxxx.workers.dev/?durl=要下载的文件直链
***
** 注意：如果下载链接中包含有特殊字符，先 encodeURIComponent
*/
domain=[,]
addEventListener(
  "fetch",event => {
    event.respondWith(
      handleRequest(event.request)
    )
  }
)

/**
 * 请求下载文件
 * @param  {web Request} request 网络请求
 * @return {web Response}        请求结果
 */
async function handleRequest(request) {
  let durl = request.url.split('/durl/')[1]
  
  if (durl) {
    if(durl.indexOf(":") != -1){
      return fetch(durl)
    }
    if ( (durl.split('/')).length != 1 ){
      durl = durl.split('/')[0]
      durl = decodeURIComponent(durl)
      return fetch(durl)
    }
    durl = decodeURIComponent(durl)
    filename = durl.split('/').pop().split('#')[0].split('?')[0]
    if ((durl.substr(-1) == '/') || ((durl.split("/")).length == 3) || ((filename.split(".")).length == 1)){
      return fetch(durl)
    }
    destinationURL = request.url + "/" + filename
    return Response.redirect(destinationURL, 301)
  }


  const init = {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  }
  //domain = request.url.split('/durl/')[0]
  domain = request.url.match(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/g)
  let data = `
  <link rel="icon" href="https://www.cloudflare.com/favicon.ico">
  <title>Speed Up Download</title>
  <style>
    body {background: #82b64a;background-image: url(` + domain + `/durl/`+encodeURIComponent(`https://unsplash.it/1600/900?random`)+`);}
    .downwrap, .project {position: fixed;display: inline;width: fit-content;max-width: 100%;left: 0;right: 0;margin: auto;}
    .downurl {height: 42px;width: 600px;border-radius: 22px;outline: none;border: none;padding: 0 16px;font-size: 20px;color: #0047AB;}
    .downwrap {top: 32%;flex-direction: column;justify-content: space-around;text-align: center;align-items: center;}
    .project {bottom: 1em;color: white;}
    .fullurl, .project {text-decoration: none;}
    .fullurl {color: white;word-break: break-all;margin-top: 8px;max-width: 560px;max-height: 600px;overflow: auto;}
  </style>
  <body>
    <div class="downwrap">
      <input class="downurl" placeholder="download link 下载地址 <Enter>">
      <a class="fullurl" href="" target="_blank"></a>
    </div>
    <div class="project">
    <a href="https://github.com/hitop/CFWorkers" target="_blank">https://github.com/hitop/CFWorkers</a><br>
    <a href="https://github.com/JarmoHu/CFWorkers" target="_blank">https://github.com/JarmoHu/CFWorkers</a>
    </div>
    <script>
      document.addEventListener('keyup', (e) => {
        const url = '/durl/' + encodeURIComponent(document.querySelector('.downurl').value)
        if (e.key === 'Enter') {
          window.open(url)
        } else {
          document.querySelector('.fullurl').innerText = url
          document.querySelector('.fullurl').href = url
        }
      })
    </script>
  </body>
  `

  return new Response(data, init)
}
