{
  "version": 2,
  "functions": {
    "api/fetch-doc.js": {
      "runtime": "nodejs20.x"
    }
  },
  "routes": [
    { "src": "/api/fetch-doc", "dest": "/api/fetch-doc.js" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
