"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const books = [
  { title: 'The Little Bear', language: 'English', hint: "childrens book", color: 'bg-blue-100' },
  { title: 'Choti Chirya', language: 'Urdu', hint: "storybook cover", color: 'bg-green-100' },
  { title: 'Counting Sheep', language: 'English', hint: "kids illustration", color: 'bg-purple-100' },
  { title: 'Aik, Do, Teen', language: 'Urdu', hint: "colorful numbers", color: 'bg-orange-100' },
  { title: 'The Magical Tree', language: 'English', hint: "fantasy tree", color: 'bg-pink-100' },
  { title: 'My First ABCs', language: 'English', hint: "alphabet blocks", color: 'bg-yellow-100' },
]

export default function LibraryView() {
  return (
    <div>
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Digital Reading Corner</h2>
            <p className="text-muted-foreground">Choose a book and start your reading adventure!</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {books.map((book) => (
                <Card key={book.title} className="overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                    <CardContent className="p-0">
                        <div className={`aspect-[3/4] ${book.color} flex items-center justify-center`}>
                           <Image 
                             src="https://placehold.co/300x400.png" 
                             alt={book.title} 
                             width={300} 
                             height={400} 
                             data-ai-hint={book.hint}
                             className="w-full h-full object-cover"
                           />
                        </div>
                        <div className="p-4 bg-card">
                            <h3 className="font-bold font-headline truncate">{book.title}</h3>
                            <p className="text-sm text-muted-foreground">{book.language}</p>
                            <Button className="w-full mt-3 btn-bounce" size="sm">Read Now</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  )
}
