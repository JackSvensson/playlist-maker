import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      )
    }

    if (playlist.user.email !== session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized to delete this playlist" },
        { status: 403 }
      )
    }

    await prisma.playlist.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete playlist error:", error)
    return NextResponse.json(
      { error: "Failed to delete playlist" },
      { status: 500 }
    )
  }
}