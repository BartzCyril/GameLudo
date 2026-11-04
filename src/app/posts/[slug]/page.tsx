import fs from "fs";
import Markdown from "markdown-to-jsx";
import matter from "gray-matter";
import getPostMetadata from "../../../components/getPostMetadata";
import {Button} from "@/components/Button";
import Link from "next/link";

const getPostContent = (slug: string) => {
    const folder = "posts/";
    const file = `${folder}${slug}.md`;
    const content = fs.readFileSync(file, "utf8");
    const matterResult = matter(content);
    return matterResult;
};

export const generateStaticParams = async () => {
    const posts = getPostMetadata();
    return posts.map((post) => ({
        slug: post.slug,
    }));
};

type PostPageProps = {
    params: Promise<{ slug: string }>;
};

const PostPage = async ({params}: PostPageProps) => {
    const {slug} = await params;
    const post = getPostContent(slug);
    const style = {
        div: {
            display: 'flex',
            justifyContent: 'center',
            margin: '25px 0'
        },
        button: {
            backgroundColor: '#5151e6',
            padding: '10px',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '10px',
        }
    }
    return (
        <div>
            <div className="text-center">
                <h2 className="mb-8 text-2xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">{post.data.title}</h2>
            </div>

            <article className="prose">
                <Markdown>{post.content}</Markdown>
            </article>

            <Link href="https://www.gameludo.app/">
                <Button buttonText={"Jouer au jeu des petits chevaux"} style={style}/>
            </Link>

        </div>
    );
};

export default PostPage;