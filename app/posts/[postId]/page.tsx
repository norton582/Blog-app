import { SubmitButton } from "@/components/submitButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PostPage(props: {
    params: Promise<{ postId: string }>//Recupere l'id du post par l'URL
}) {
    const params = await props.params;
    console.log(params.postId);
    const post = await prisma.post.findUnique({
        where: {
            id: Number(params.postId),
        },
        include: {
            commentaire: {
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });
    if (!post) {
        return notFound();
    }
    return (
        <div className="flex flex-col gap-6 max-w-lg mx-auto py-8">
            <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                ⬅️ Retour à la liste des posts
            </Link>
            <Card className="border dark:bg-gray-800">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {post.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        Posté le {post.createdAt.toLocaleDateString()}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div>
                        {
                            post.content?.split('\n').map((paragraph, index) => (
                                <p key={index} className="mb-4 text-gray-700 dark:text-gray-300">
                                    {paragraph}
                                </p>
                            ))
                        }
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start">
                    <div className="mt-8">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-300">Commentaire ({post.commentaire.length})</h3>
                    </div>
                    <div>
                        {
                            post.commentaire.map((comment) => (
                                <div key={comment.id} className="mb-4">
                                    <div className="flex gap-2">
                                        <Avatar>
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback>User</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-sm text-gray-800 dark:text-gray-300">
                                                {comment.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {comment.content}
                                            </div>
                                        </div>
                                        
                                    </div>
                                    <div className="border-t mt-2 min-w-md"></div>
                                </div>
                                
                            ))
                        }

                        {
                            post.commentaire.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400">
                                    Aucun commentaire pour ce post.
                                </p>
                            )
                        }

                    </div>
                    <div className="w-full mt-2">
                        <form action={async(formData) => {
                            "use server";//Utilisation de serveur action pour la soumission du formulaire

                            const name = formData.get('name') as string;
                            const content = formData.get('content') as string;

                            await prisma.commentaire.create({
                                data : {
                                    name : name || 'Anonyme',
                                    content: content,
                                    postId : post.id
                                }
                            })

                            revalidatePath('/posts/' + post.id);
                        }} className="flex flex-col gap-2">
                            <Input name="name" placeholder="Nom d'utilisateur"/>
                            <Input name="content" placeholder="Commentaire..."/>
                            <div><SubmitButton/></div>
                        </form>
                    </div>
                    
                </CardFooter>
            </Card>
          
        </div>
    )
}

