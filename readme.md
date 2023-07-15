# Blog Generator App

This is a Node.js application that generates a blog using various API endpoints. It utilizes the Express router to handle different routes and controllers for generating different parts of the blog.

## Getting Started

To get started, clone the repository and run `npm ci` to clean install the dependencies. Then run `npm run build` to build the application. Finally, run `npm run start` to start the application.

## ENV Variables

Put the following environment variables in a .env file in the root directory of the project: 
``` 
OPENAI_API_KEY
SECRET
PORT
```

## API Endpoints

The following are the API endpoints that are available:

### Generate Blog By Broad Topic (GET)
**Endpoint:** `/api/generate-blog-by-broad-topic/:topic?exclude=topic1&exclude=topic2`
This endpoint automatically calls keyword research, generates a topic, generates an outline, title, and blog content and returns it as a JSON object. It takes a broad topic as a parameter and a list of topics you wish to exclude from the blog in the query. As this endpoint typically takes a while to generate the blog, it is recommended to use the other endpoints to generate the blog programmatically.

**Response Body:**

```json
{
    "title": "title",
    "blog_content": [
        {
            "type": "h1",
            "content": "h1 content"
        },
        {
            "type": "p",
            "content": "h1 paragraph content"
        },
        {
            "type": "h2",
            "content": "h2 content"
        },
        {
            "type": "p",
            "content": "h2 paragraph content"
        }
    ],
    "meta_tags": {
        "title": "title",
        "description": "description",
        "keywords": "keywords"
    },
    "keywords": ["keyword 1", "keyword 2", "keyword 3"],
    "outline": "outline",
    "topic": "topic",

}
```

### Generate Keyword Research (POST)
**Endpoint:** `/api/generate-keyword-research`
This endpoint generates a list of keywords based on a broad topic, blog title, and keyword exclusions.

**Request Body:**

```json
{
    "broad_topic": "broad topic",
    "keyword_exclusions": ["keyword exclusion 1", "keyword exclusion 2"]
}
```

**Response Body:**

```json
{
    "keywords": ["keyword 1", "keyword 2", "keyword 3"]
}
```

### Generate Topics (POST)
**Endpoint:** `/api/generate-topics`
This endpoint generates a list of topics based on a broad topic, keywords, and keyword exclusions.

**Request Body:**

```json
{
    "broad_topic": "broad topic",
    "keywords": ["keyword 1", "keyword 2", "keyword 3"],
    "keyword_exclusions": ["keyword exclusion 1", "keyword exclusion 2"]
}
```

**Response Body:**

```json
{
    "topics": ["topic 1", "topic 2", "topic 3"]
}
```

### Generate Outline (POST)
**Endpoint:** `/api/generate-outline`
This endpoint generates a blog outline based on a broad topic.

**Request Body:**

```json
{
    "broad_topic": "broad topic"
}
```

**Response Body:**

```json
{
    "outline": "outline"
}
```

### Generate Title (POST)
**Endpoint:** `/api/generate-title`
This endpoint generates a blog title based on an outline, keyword exclusions, and featured keywords.

**Request Body:**

```json
{
    "outline": "outline",
    "exclude": ["keyword exclusion 1", "keyword exclusion 2"],
    "feature": ["featured keyword 1", "featured keyword 2"]
}
```

**Response Body:**

```json
{
    "title": "title"
}
```

### Generate Headings (POST)
**Endpoint:** `/api/generate-headings`
This endpoint generates a list of headings for a blog based on an outline, topic, title, and keywords.

**Request Body:**

```json
{
    "outline": "outline",
    "topic": "topic",
    "title": "title",
    "keywords": ["keyword 1", "keyword 2", "keyword 3"]
}
```

**Response Body:**

```json
{
    "headings": [{
        "type": "heading1 type",
        "content": "heading1 content"
        },
        {
        "type": "heading2 type",
        "content": "heading2 content"
        },
        {
        "type": "heading3 type",
        "content": "heading3 content"
        },
    ]
}
```


### Generate Paragraph (POST)
**Endpoint:** `/api/generate-paragraph`
This endpoint generates a paragraph for a blog give a list of headings, an index, total headings length, an array representing the blog content, keywords, and keyword exclusions.

**Request Body:**

```json
{
    "headings": [{
        "type": "heading1 type",
        "content": "heading1 content"
        },
        {
        "type": "heading2 type",
        "content": "heading2 content"
        },
        {
        "type": "heading3 type",
        "content": "heading3 content"
        },
    ],
    "part": 1,
    "partsLength": 3,
    "blogContent": [
        {
            "type": "h1",
            "content": "h1 content"
        },
        {
            "type": "p",
            "content": "h1 paragraph content"
        },
        {
            "type": "h2",
            "content": "h2 content"
        },
        {
            "type": "p",
            "content": "h2 paragraph content"
        }
    ],
    "keywords": ["keyword 1", "keyword 2", "keyword 3"],
    "exclude": ["keyword exclusion 1", "keyword exclusion 2"]
}
```

**Response Body:**

```json
{
    "paragraph": "paragraph"
}
```

### Generate Blog Content (POST)
**Endpoint:** `/api/generate-blog-content`
This endpoint generates a blog content given a broad topic, blog title, keywords, keyword exclusions, and featured keywords. It may take a while to generate the blog.

**Request Body:**

```json
{
    "broad_topic": "broad topic",
    "blog_title": "blog title",
    "keywords": ["keyword 1", "keyword 2", "keyword 3"],
    "keyword_exclusions": ["keyword exclusion 1", "keyword exclusion 2"],
    "featured_keywords": ["featured keyword 1", "featured keyword 2"]
}
```

**Response Body:**

```json
{
    "blog_content": [
        {
            "type": "h1",
            "content": "h1 content"
        },
        {
            "type": "p",
            "content": "h1 paragraph content"
        },
        {
            "type": "h2",
            "content": "h2 content"
        },
        {
            "type": "p",
            "content": "h2 paragraph content"
        }
    ]
}
```

### Generate Meta Tags (POST)
**Endpoint:** `/api/generate-meta-tags`
This endpoint generates meta tags for a blog given a blog title, blog outline, keywords, keyword exclusions, and featured keywords.

**Request Body:**

```json
{
    "blog_title": "blog title",
    "outline": "outline",
    "keywords": ["keyword 1", "keyword 2", "keyword 3"],
    "keyword_exclusions": ["keyword exclusion 1", "keyword exclusion 2"],
    "featured_keywords": ["featured keyword 1", "featured keyword 2"]
}
```

**Response Body:**

```json
{
    "meta_tags": {
        "title": "title",
        "description": "description",
        "keywords": "keywords"
    }
}
```

## License

[MIT](https://choosealicense.com/licenses/mit/)


## Authors

- [**Tom Turner**](mailto:tom@ttcreative.limited)