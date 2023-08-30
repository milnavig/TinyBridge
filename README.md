# TinyBridge
## A simple URL shortener

### How to launch
```
docker-compose build  # Assembly of containers
docker-compose up     # Running containers
```

### How to use

**Generate a new shortened URL**
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

**Use the generated shortened URl**
Request:
```
GET http://localhost:5000/98438

```

### How to improve

When planning to scale the application, I would capitalize on the advantages of a microservices architecture. To begin, I'd implement a dynamic instance creation approach, where the number of service instances adjusts according to the current load—more instances during higher loads. These instances would be responsible for generating short URLs, forming what I'll refer to as the 'url_shortener_service'. To manage incoming requests and distribute them efficiently, I'd utilize the API-gateway template. In adherence to this pattern, I'd establish a primary 'main_API' service that incorporates a load balancer. I could opt for a RoundRobin algorithm for even distribution or select instances randomly. This approach ensures that incoming traffic is intelligently managed across multiple instances of the 'url_shortener_service.'

Scaling the databases, specifically Redis and MySQL, would involve sharding. For instance, I would create two separate databases. In one database, I'd store data related to short URLs with alphabetical first characters, while the other database would house data associated with short URLs beginning with digits. This sharding strategy enhances data distribution and retrieval efficiency.

Additionally, an essential aspect of this architecture is implementing robust monitoring mechanisms. By incorporating monitoring tools, we gain insights into the performance, health, and potential bottlenecks of the system. 

