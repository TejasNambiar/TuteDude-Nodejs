const http = require("http");
const fs = require("fs");
const PORT = 3000;

const app = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    pointToHtml(res, req, "./home.html");
    console.log("Served Home Page");
  } else if (req.url === "/about") {
    res.writeHead(200, { "Content-Type": "text/html" });
    pointToHtml(res, req, "./about.html");
    console.log("Served About Page");
  } else if (req.url === "/contact") {
    res.writeHead(200, { "Content-Type": "text/html" });
    pointToHtml(res, req, "./contact.html");
    console.log("Served Contact Page");
  } else if (req.url === "/styles.css") {
    res.writeHead(200, { "Content-Type": "text/css" });
    let css = fs.readFileSync("./styles.css");
    res.write(css);
    res.end();
    console.log("Served Styles");
    return;
  } else if (req.url === "/not-found.jpeg") {
    // Serve the 404 illustration image with correct content-type
    try {
      const img = fs.readFileSync("./not-found.jpeg");
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.write(img);
      res.end();
      console.log("Served not-found.jpeg");
      return;
    } catch (err) {
      console.error("Error reading not-found.jpeg:", err);
      // fall through to 404 handler below
    }
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    pointToHtml(res, req, "./not_found.html");
    res.end();
    return;
  }
  res.end();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function pointToHtml(res, req, path) {
  console.log(`Received request for: http://localhost:${PORT}${req.url}`);
  console.log("Routing to file:", path);
  console.log("Reading-loading html file from path:", path);
  let html = fs.readFileSync(path);
  res.write(html);
}
