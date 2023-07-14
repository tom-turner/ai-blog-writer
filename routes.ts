import { Router, Request, Response } from 'express';
import { Configuration, OpenAIApi } from 'openai';

const router = Router();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const keywordResearch = async (broadTopic: string, blogTitle: string | null = '', keywordExclusions: string[] = []) => {
    const keywordResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Generate diverse, relevant keywords for SEO optimization of a blog post on a given broad-topic. ${ blogTitle ? `The title of the blog post is: ${blogTitle}` : ''}. Your broad-topic is: ${broadTopic}. ${ keywordExclusions.length > 0 ? `Please exclude any references to the following keywords: [${keywordExclusions.join(',')}]` : ''}\n`,
        temperature: 0.5,
        max_tokens: 120,
        top_p: 1,
        n: 1,
    });

    return keywordResponse.data.choices[0].text?.split('\n').filter((s) => s).map(s => s.split('.')[1]?.trim()) || [];
};

const generateTopics = async (broadTopic: string, keywords: string[] = [], topic_exclusions: string[] = []) => {
    const topicResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Generate a list of topics for a blog post on a given broad-topic. Your broad-topic is: ${broadTopic}. ${ keywords.length > 0 ? `Where relevent, relate the topic to a given keyword from this list' : [${keywords.join(',')}]` : ''} ${ topic_exclusions.length > 0 ? `Please exclude any references to the following topics: [${topic_exclusions.join(',')}]` : ''}\n`,
        temperature: 0.5,
        max_tokens: 120,
        top_p: 1,
        n: 1,
    });

    return topicResponse.data.choices[0].text?.split('\n').filter((s) => s).map(s => s.split('.')[1]?.trim()) || [];
};

const generateOutline = async (topic: string, keywords: string[]) => {
    const outlineResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Create an outline for a blog post on the topic of ${topic}. Your task is to generate a structured outline that covers key aspects of the subject matter. Incorporate the following keywords into the outline to ensure comprehensive coverage: ${keywords}. The outline should provide a clear flow of ideas and sections that engage readers and deliver valuable insights on the given topic.`,
        temperature: 0.5,
        max_tokens: 500,
        top_p: 1,
        n: 1,
    });

    return outlineResponse.data.choices[0].text || '';
};

const generateHeadings = async (outline: string, topic: string, keywords: string[] = [] ): Promise<{
    type: string;
    content?: string;
    image_description?: string;
}[]> => {
    const headingsResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Generate a list of headings and image tags for a blog post based on a given outline and topic. Your outline is: ${outline}. Your topic is: ${topic}. Respond with a JSON array where each item represents a heading in the format {"type": "heading type <h1, image, h2, h3>", "content": "..." || "image_description": "..."}. The headings should accurately reflect the sections of the outline and provide a clear structure for the blog post, ${ keywords.length > 0 ? `Where relevent, a heading should include a keyword from this list: [${keywords.join(',')}]` : ''}.`,
        temperature: 0.5,
        max_tokens: 500,
        top_p: 1,
        n: 1,
    });

    try {
        return JSON.parse(headingsResponse.data.choices[0].text || '');
    } catch (e) {
        console.log('Error parsing headings response, retrying...')
        return generateHeadings(outline, topic, keywords); 
    }
};

const generateTitle = async (outline: string, topic: string, exclude: string[] = [], feature: string[] = []) => {
    const titleResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Generate a blog title for a blog post on a given outline and/or topic. Your outline is: ${outline}. Your topic is: ${topic}. ${ exclude.length > 0 ? `Please exclude any references to the following topics: [${exclude.join(',')}]` : ''} ${ feature.length > 0 ? `Please include the following keywords: [${feature.join(',')}]` : ''}\n`,
        temperature: 0.5,
        max_tokens: 120,
        top_p: 1,
        n: 1,
    });

    return titleResponse.data.choices[0].text || '';
};

const generateParagraph = async (heading: string, topic: string, keywords: string[] = [], feature: string[] = []) => {

};

router.get('/', async (req: Request, res: Response) => {
    const broadTopic = 'how to write a blog post';
    const excludeTopics = ['blog post', 'blog', 'write'];

    const keywords = await keywordResearch(broadTopic, null , excludeTopics);
    console.log(keywords);
    const topics = await generateTopics(broadTopic, keywords, excludeTopics);
    console.log(topics);
    // select a random topic from the list of topics
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const outline = await generateOutline(topic, keywords);
    console.log(outline);

    const headings = await generateHeadings(outline, topic, keywords);
    console.log(headings);

    const title = await generateTitle(outline, topic, keywords, excludeTopics);
    console.log(title);
    
    res.send('Application works!');
});

router.post('/keyword-research', async (req: Request, res: Response) => {
    const keywords = await keywordResearch(req.body.broad_topic , req.body.blog_title, req.body.keyword_exclusions);
    res.send(keywords);
});

router.post('/generate-topics', async (req: Request, res: Response) => {
    const topics = await generateTopics(req.body.broad_topic, req.body.keywords, req.body.keyword_exclusions);
    res.send(topics);
});

router.post('/generate-outline', async (req: Request, res: Response) => {
    const outline = await generateOutline(req.body.broad_topic, req.body.topics);
    res.send(outline);
});

router.post('/generate-title', async (req: Request, res: Response) => {
    const title = await generateTitle(req.body.outline, req.body.exclude, req.body.feature);
    res.send(title);
});

export default router;