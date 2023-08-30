# TinyBridge
## A simple URL shortener

### How to launch
```
docker-compose build  # Assembly of containers
docker-compose up     # Running containers
```

### How to use

*Generate a new shortened URL*
Request:
```
POST http://0.0.0.0:5000/generate
Content-Type: application/json
{ 
    "url": "https://docs.github.com/en/get-started/writing-on-github/" 
}
```

Response:
```
HTTP/1.1 201 Created
Content-Type: application/json
{
    "shortURL": "http://localhost:5000/98438"
}
```

*Use the generated shortened URl*
Request:
```
GET http://localhost:5000/98438

```

