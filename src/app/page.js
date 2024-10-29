import Head from 'next/head';
import VideoChat from './components/Videochat';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
    return (
        <div>
            <Head>
                <title>Video Chat App</title>
            </Head>
            <main>
                <VideoChat />
            </main>
        </div>
    );
}
