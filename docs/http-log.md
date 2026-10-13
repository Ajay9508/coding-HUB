# Annotated public HTTP request log

The following requests are read-only `GET`s against JSONPlaceholder, a public fake JSON REST API. The successful response fields below were checked against the service's guide and live JSON response pages on 2026-10-13. These examples do not mutate the remote service.

## 1. Read a post

```http
GET /posts/1 HTTP/1.1
Host: jsonplaceholder.typicode.com
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{"userId":1,"id":1,"title":"sunt aut facere repellat provident occaecati excepturi optio reprehenderit","body":"quia et suscipit…"}
```

The single-resource representation contains the owning user, identifier, title, and body.

## 2. Read a user

```http
GET /users/1 HTTP/1.1
Host: jsonplaceholder.typicode.com
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{"id":1,"name":"Leanne Graham","username":"Bret","email":"Sincere@april.biz","address":{"city":"Gwenborough"},"phone":"1-770-736-8031 x56442","website":"hildegard.org"}
```

The real response contains additional address and company fields; this log shows a representative excerpt.

## 3. Filter a collection

```http
GET /posts?userId=1 HTTP/1.1
Host: jsonplaceholder.typicode.com
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
[{"userId":1,"id":1,"title":"sunt aut facere repellat provident occaecati excepturi optio reprehenderit","body":"quia et suscipit…"}, {"userId":1,"id":2,"title":"qui est esse","body":"est rerum tempore vitae…"}, "… 8 more matching posts"]
```

Filtering uses a query parameter and returns a JSON array (10 matching posts for this request).

## 4. Read a related collection

```http
GET /comments?postId=1 HTTP/1.1
Host: jsonplaceholder.typicode.com
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
[{"postId":1,"id":1,"name":"id labore ex et quam laborum","email":"Eliseo@gardner.biz","body":"laudantium enim quasi est quidem magnam voluptate ipsam eos…"}, "… 4 more comments"]
```

Five comments were returned for the selected post. The response excerpt is shortened for readability.

## 5. Deliberate missing-resource request

```http
GET /posts/999999 HTTP/1.1
Host: jsonplaceholder.typicode.com
Accept: application/json
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8
Content-Length: 2
```

The unavailable resource was deliberately requested. The observed body was:

```json
{}
```

JSONPlaceholder does not return an error object for this missing ID.

## References

- [JSONPlaceholder guide](https://jsonplaceholder.typicode.com/)
- [Post 1 JSON response](https://jsonplaceholder.typicode.com/posts/1)
- [User 1 JSON response](https://jsonplaceholder.typicode.com/users/1)
- [Posts filtered by user 1](https://jsonplaceholder.typicode.com/posts?userId=1)
- [Comments filtered by post 1](https://jsonplaceholder.typicode.com/comments?postId=1)
