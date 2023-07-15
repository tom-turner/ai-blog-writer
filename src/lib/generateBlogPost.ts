
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const keywordResearch = async (broadTopic: string, blogTitle: string | null = '', keywordExclusions: string[] = []) => {
    const keywordResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Generate diverse, relevant keywords for SEO optimization of a blog post on a given broad-topic. ${ blogTitle ? `The title of the blog post is: ${blogTitle}` : ''}. Your broad-topic is: ${broadTopic}. ${ keywordExclusions.length > 0 ? `Please exclude any references to the following keywords: [${keywordExclusions.join(',')}]` : ''}\n`,
        temperature: 0.8,
        max_tokens: 120,
        top_p: 0.8,
        n: 1,
    });

    return keywordResponse.data.choices[0].text?.split('\n').filter((s) => s).map(s => s.split('.')[1] ? s.split('.')[1]?.trim() : s.trim()) || [];
};

export const generateTopics = async (broadTopic: string, keywords: string[] = [], topic_exclusions: string[] = []) => {
    const topicResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Generate a list of topics for a blog post on a given broad-topic. Your broad-topic is: ${broadTopic}. ${ keywords.length > 0 ? `Where relevent, relate the topic to a given keyword from this list' : [${keywords.join(',')}]` : ''} ${ topic_exclusions.length > 0 ? `Please exclude any references to the following topics: [${topic_exclusions.join(',')}]` : ''}\n`,
        temperature: 0.8,
        max_tokens: 120,
        top_p: 0.8,
        n: 1,
    });

    return topicResponse.data.choices[0].text?.split('\n').filter((s) => s).map(s => s.split('.')[1]?.trim()) || [];
};

export const generateOutline = async (topic: string, keywords: string[]) => {
    const outlineResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Create a concise search engine optimised outline for a blog post on the topic of ${topic}. Your task is to generate a structured outline that covers key aspects of the subject matter. Incorporate the following keywords into the outline to ensure comprehensive coverage: ${keywords}. The outline should provide a clear flow of ideas and sections that engage readers and deliver valuable insights on the given topic.`,
        temperature: 0.8,
        max_tokens: 400,
        top_p: 0.8,
        n: 1,
    });

    return outlineResponse.data.choices[0].text || '';
};

export const generateHeadings = async (outline: string, topic: string, title: string, keywords: string[] = [] ): Promise<{
    type: string;
    content?: string;
    image_description?: string;
}[]> => {
    const headingsResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Generate a list of headings and images for a blog post based on the given outline and topic and title. The headings should accurately reflect the sections of the outline and provide a clear structure for the blog post and the images should accurately blog topic. Your outline is: ${outline}. Your topic is: ${topic}. Your title is: ${title}. ${ keywords.length > 0 ? `Where relevant, a heading must include a keyword from this list: [${keywords.join(',')}]` : ''}. 
        Return a valid JSON array of objects. Each object represents a heading in the format:\n
        [{
          "type": "heading type <h2 or h3, sometimes an image>",
          "content": "..." or "image_description": "..."
        }, ...]`,
        temperature: 0.8,
        top_p: 1,
        n: 1,
        max_tokens: 2048,
    });

    try {
        return JSON.parse(headingsResponse.data.choices[0].text || '');
    } catch (e) {
        console.log('Error parsing headings response, retrying...')
        return generateHeadings(outline, topic, title, keywords); 
    }
};

export const generateTitle = async (outline: string, topic: string, exclude: string[] = [], feature: string[] = []) => {
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

export const generateImage = async (image_description: string) => {
    return fetch(`https://source.unsplash.com/random/900x600?${image_description}`).then((res) => res.url);
};

export const generateParagraph = async (heading: string | undefined, part: number, partsLength: number, blogContent: {type: string, content: string}[], topic: string, title: string, keywords: string[] = [], exclude: string[] = [] ) => {
    
    const paragraphResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: 'system',
                content: `You are a unique, personal and down to earth blog writer tasked with completeling only the next sentence of a blog on the given topic: ${topic}. Overall the blog post should provide comprehensive coverage and optimal SEO by incorporating relevant keywords. Ensure that each paragraph is informative but consice, delivers valuable insights, engages readers, and maintains a clear flow of ideas within given broader content. should introduce new information or provide a different perspective. Avoid duplicating sentences or ideas. Each paragraph must introduce new information or provide a different perspective.`
            },
            {
                role: 'assistant',
                content: `The blog is titled: ${title}\n
                The current content of the blog you are being asked to finish is as follows:
                ${blogContent?.map(li => li.content).join('\n')}\n
                ${exclude.length > 0 ? `Excluded topics: [${exclude.join(',')}]` : ''}\n
                ${keywords.length > 0 ? `Keywords: [${keywords.join(',')}]` : ''}\n.
                This is part ${part + 1} of ${partsLength} of the blog post. The blog post must be a maximum of 800 words and is currently ${blogContent?.map(li => li.content).join(' ').length} characters long. 
                `
            },
            {
                role: 'user',
                content: `Write the next sentence or two for the section under a given heading. Keep it under 50 words, entertaining, relevent to the keywords and heading and the context of where it resides in the article. Your heading is: ${heading}`
            }
        ],
        temperature: 0.8,
        max_tokens: 200,
        top_p: 1,
        frequency_penalty: 0.2,
        presence_penalty: 0.4,
        n: 1,
    });

    const wordLength = paragraphResponse.data.choices[0].message?.content?.split(' ').length || 0;

    console.log('Generated paragraph with length: ', wordLength);

    return paragraphResponse.data.choices[0].message?.content || '';
}

export const generateBlogContent = async (
    headings: { type: string, content?: string, image_description?: string }[],
    outline: string,
    blogContent: { type: string, content: string }[] = [],
    topic: string,
    title: string,
    keywords: string[] = [],
    exclude: string[] = [],
    headingIndex: number = 0,
): Promise<any> => {
    if (headingIndex >= headings.length) {
        return {
            blogContent,
        };
    }

    const { type, content, image_description } = headings[headingIndex];
    
    console.log('Generating paragraph for: ', content)

    if(headingIndex === 0) {
        blogContent.push({ type: 'title', content: title });
    }

    const generatedContent = await (async () => {
        if(type === 'image' && image_description) {
            return {
                type: 'image_url',
                content: await generateImage(image_description)
            }
        } else {
            return {
                type: 'p',
                content: await generateParagraph(content, headingIndex, headings.length, blogContent, topic, title, keywords, exclude)
            }
        }
    })();
    blogContent.push({ type, content: content || image_description || '' });
    blogContent.push(generatedContent);

    console.log('Generated content: ', generatedContent)

    return generateBlogContent(headings, outline, blogContent, topic, title, keywords, exclude, headingIndex + 1);
};

export const generateMeta = async (title: string, outline: string, keywords: string[] = [], exclude: string[] = []) => {
    const metaResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Generate a list of html meta data for a blog post on a given title and blog outline. Your title is: ${title}. 
        Ensure that the meta description is concise, informative, and engaging. Sugest any other meta tags that may be relevant to this blog post such as image tags or keywords.
        You must reply in the following format:
        [
            {
                "name": "title",
                "content": "${title}"
            }
            {
                "name": "description",
                "content": "..."
            } 
            {
                "name": "keywords",
                "content": "..."
            }, etc...
        ]
        The blog outline is: ${outline}. ${exclude.length > 0 ? `Please exclude any references to the following topics: [${exclude.join(',')}]` : ''} ${keywords.length > 0 ? `Please use the following keywords where relevent: [${keywords.join(',')}]` : ''}\n`,
        temperature: 0.5,
        max_tokens: 1024,
        top_p: 1,
        n: 1,
    });

   try {
    return JSON.parse(metaResponse.data.choices[0].text || '');
   }
    catch(e) {
        console.log(e);
        return metaResponse.data.choices[0].text || '';
    }
};
