import { getRequestConfig } from "next-intl/server";
import { locales } from "./routing";

const messages: Record<string, any> = {};

async function loadMessages(locale: string) {
  if (!messages[locale]) {
    messages[locale] = (await import(`../../messages/${locale}.json`)).default;
  }
  return messages[locale];
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale as any)) locale = "en";

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
