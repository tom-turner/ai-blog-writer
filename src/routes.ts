import { Router, Request, Response } from 'express';
import apiAuthMiddleware from './middleware/apiAuthMiddleware';
import generateApiKey from './lib/generateApiKey';
import {
    keywordResearch,
    generateTopics,
    generateOutline,
    generateTitle,
    generateHeadings,
    generateParagraph,
    generateBlogContent,
    generateMeta,
} from './lib/generateBlogPost';

const router = Router();

router.use('/api/generate-keyword-research', apiAuthMiddleware, async (req: Request, res: Response) => {
    const keywords = await keywordResearch(req.body.broad_topic , req.body.blog_title, req.body.keyword_exclusions);
    res.json(keywords);
});

router.post('/api/generate-topics', apiAuthMiddleware, async (req: Request, res: Response) => {
    const topics = await generateTopics(req.body.broad_topic, req.body.keywords, req.body.keyword_exclusions);
    res.json(topics);
});

router.post('/api/generate-outline', apiAuthMiddleware, async (req: Request, res: Response) => {
    const outline = await generateOutline(req.body.broad_topic, req.body.topics);
    res.json(outline);
});

router.post('/api/generate-title', apiAuthMiddleware, async (req: Request, res: Response) => {
    const title = await generateTitle(req.body.outline, req.body.exclude, req.body.feature);
    res.json(title);
});

router.post('/api/generate-headings', apiAuthMiddleware, async (req: Request, res: Response) => {
    const headings = await generateHeadings(req.body.outline, req.body.topic, req.body.title, req.body.keywords);
    res.json(headings);
});

router.post('/api/generate-paragraph', apiAuthMiddleware, async (req: Request, res: Response) => {
    const paragraph = await generateParagraph(req.body.headings, req.body.part, req.body.partsLength, req.body.blogContent, req.body.keywords, req.body.exclude);
    res.json(paragraph);
});

router.post('/api/generate-blog-content', apiAuthMiddleware, async (req: Request, res: Response) => {
    const content = await generateBlogContent(req.body.headings, req.body.outline, [], req.body.topic, req.body.title, req.body.keywords, req.body.exclude);
    res.json(content);
});

router.post('/api/generate-meta', apiAuthMiddleware, async (req: Request, res: Response) => {
    const meta = await generateMeta(req.body.title, req.body.content, req.body.keywords, req.body.exclude);
    res.json(meta);
});

router.get('/api/generate-by-broad-topic/:broadtopic', apiAuthMiddleware, async (req: Request, res: Response) => {
    const broadTopic = req.params.broadtopic;
    const excludeTopics = req.query.exclude?.toString().split(',') || [];

    console.log('Generating blog post for broad topic: ', broadTopic)

    const keywords = await keywordResearch(broadTopic, null , excludeTopics);
    console.log('Keywords successfully generated.');

    const topics = await generateTopics(broadTopic, keywords, excludeTopics);
    const topic = topics[Math.floor(Math.random() * topics.length)];
    console.log('Topic successfully generated.');

    const outline = await generateOutline(topic, keywords);
    console.log('Outline successfully generated.');

    const title = await generateTitle(outline, topic, keywords, excludeTopics);
    console.log('Title successfully generated.');

    const headings = await generateHeadings(outline, topic, title, keywords);
    console.log('Headings successfully generated.');

    const content = await generateBlogContent(headings, outline, [], topic, title, keywords, excludeTopics);
    console.log('Content successfully generated.');

    const meta = await generateMeta(title, content, keywords, excludeTopics);
    console.log('Meta successfully generated.');

    res.json({
        title,
        meta,
        content,
        keywords, 
        topic,
        outline,
    });
});

router.get('/api/get-api-key', async (req: Request, res: Response) => {  
    const genApiKey = await generateApiKey();

    req.session.apiKey = genApiKey;

    res.json({
        apiKey: genApiKey,
    });
});

router.get('/', (req: Request, res: Response) => {
    res.send(`To get started, please visit the documentation on <a href="https://github.com/tom-turner/ai-blog-writer" style={{ color: 'white' }}>Github</a>`);
});

export default router;