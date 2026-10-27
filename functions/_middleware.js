// Runs before every request: send http:// visitors (and Google) to https:// so only one version of each page is indexed.
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.protocol === "http:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
