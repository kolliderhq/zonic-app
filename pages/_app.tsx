import 'styles/tailwind.scss';
import 'styles/globals.scss';
import 'styles/styles.scss';

import React from 'react';
import { Provider } from 'react-redux';

import PlausibleProvider from 'next-plausible';
import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import { SWRConfig } from 'swr';

import { DataInit } from 'components/DataInit';
import { PageWrapper } from 'components/wrappers/PageWrapper';
import { reduxStore } from 'contexts/store';
import { defaultOnErrorRetry, fetcher } from 'utils/fetchers';
import { googleTranslateException } from 'utils/misc';

function MyApp({ Component, pageProps }: AppProps) {
	const init = React.useMemo(() => <DataInit />, []);
	return (
		<Provider store={reduxStore}>
			<SWRConfig
				value={{
					refreshInterval: 0,
					fetcher: fetcher,
					// shouldRetryOnError: false,
					// onErrorRetry: false,
					onErrorRetry: defaultOnErrorRetry,
				}}>
				<DefaultSeo
					title="Zonic"
					description="Synthetic stablecoins."
					canonical={'trade.kollider.xyz'}
					twitter={{
						handle: '@zonic',
						// site: '@site',
						cardType: 'summary_large_image',
					}}
				/>
				{init}
				<PageWrapper>
					<Component {...pageProps} />
				</PageWrapper>
			</SWRConfig>
		</Provider>
	);
}

googleTranslateException();

export default MyApp;
