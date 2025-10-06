
import { SubmitButton } from "@/components/submitButton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";


export default async function Home() {

  const [Posts, countPost] = await prisma.$transaction([
    prisma.post.findMany({
      select:{
        id:true,
        title:true,
        content:true,
        createdAt:true,
        _count : {
          select:{
            commentaire:true
          }
        }
      }
    }),
    prisma.post.count()
  ])
  


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      
      <div className="max-w-md mx-auto grid gap-6">
      <h1 className="font-medium text-sm text-gray-700 dark:text-gray-200">Dérnier Post ({countPost})</h1>
        {
          Posts.map((post) =>(
            <Link href={'/posts/'+post.id} key={post.id} className="block hover:shadow-lg transition-shadow duration-300">
              <Card className="w-full border dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800 dark:text-white">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">{post.createdAt.toLocaleDateString()} <span>📃{post._count.commentaire} commentaires</span></CardDescription>
                </CardHeader>
                <CardContent className="text-gray-600 dark:text-gray-300">
                  {post.content?.substring(0, 150)}...
                </CardContent> 
                <CardFooter className="justify-end">
                  <span className="text-sm font-medium text-blue-500">Voir plus➡️</span>
                </CardFooter>
              </Card>
            </Link>
          ))
        }
        {
          Posts.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Aucun post disponible.
            </div>
          )
        }
        <form action={async(formData) => {
            "use server";//Utilisation de serveur action pour la soumission du formulaire
            const title = formData.get('title') as string;
            const content = formData.get('content') as string;

            await prisma.post.create({
              data:{
                title:title,
                content:content
              }
            })

            revalidatePath('/');

          }} className="flex flex-col gap-4 rounded-md border p-4">
          <p className="font-medium">Créer un post</p>
          <Input name="title"/>
          <Textarea name="content"></Textarea>
          <SubmitButton/>
        </form>
      </div>
    </div>
  );
}


