type PageProps = {
    params: Promise<{
        peerId: string;
    }>;
};

export default async function Page({ params }: PageProps) {
    const { peerId } = await params;
    
    return <div>My PeerID: {peerId}</div>
}