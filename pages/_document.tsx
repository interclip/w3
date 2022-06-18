import Document, {
    DocumentContext,
    DocumentProps,
    Head,
    Html,
    Main,
    NextScript,
} from 'next/document';
import React from 'react';

type Props = Record<string, unknown> & DocumentProps;

class InterclipDocument extends Document<Props> {
    static async getInitialProps(context: DocumentContext) {
        const initialProps = await Document.getInitialProps(context);
        return { ...initialProps };
    }

    render() {
        return (
            <Html lang="en">
                <Head>
                    <meta charSet="utf-8" />
                    <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
                    <meta content="The next generation of sharing" name="description" />
                    <meta content="website" property="og:type" />
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
                    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap" rel="stylesheet" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default InterclipDocument;