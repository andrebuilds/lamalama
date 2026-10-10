import Link from "next/link"

import { cookies, legal, localStorageItems } from "../lib/legal"
import { LegalDocument, LegalTable } from "./legal-document"

/**
 * Cookie Policy. Every cookie is technical, so no consent is needed (art. 122
 * of the Italian Privacy Code, Garante guidelines of 10 June 2021): the
 * notice only informs.
 */
export function CookiePolicy() {
  return (
    <LegalDocument
      title="Cookie Policy"
      intro={
        <p>
          LamaLama uses only the cookies it needs to work. No analytics, no ads,
          no tracking, no third-party cookies. That&apos;s why we don&apos;t ask
          for your consent: we only tell you.
        </p>
      }
    >
      <h2>1. What cookies are</h2>
      <p>
        Cookies are small text files a website saves in your browser, so it can
        remember something between one page and the next, such as the fact that
        you are signed in. Browser storage (localStorage) is similar, but its
        content stays in your browser and is never sent to us.
      </p>

      <h2>2. Which cookies we use</h2>
      <p>
        All of them are first-party (set by lamalama.video) and strictly
        necessary: they are used only to provide the service you ask for, keep
        it secure and remember your settings. Under art. 122 of the Italian
        Privacy Code (Legislative Decree 196/2003) and the Italian data
        protection authority&apos;s cookie guidelines of 10 June 2021, these
        cookies don&apos;t need consent. Most only appear after you sign in. On
        the live site, the sign-in cookie names begin with
        &quot;__Secure-&quot;, which tells the browser to send them only over
        HTTPS.
      </p>
      <LegalTable
        head={["Cookie", "What it does", "How long it lasts"]}
        rows={cookies.map((cookie) => [
          <code key={cookie.name} className="text-xs break-all">
            {cookie.name}
          </code>,
          cookie.purpose,
          cookie.duration,
        ])}
      />

      <h2>3. Browser storage</h2>
      <p>
        These items are saved in your browser&apos;s localStorage. They only
        hold preferences, never personal data, and they never leave your device.
      </p>
      <LegalTable
        head={["Item", "What it remembers"]}
        rows={localStorageItems.map((item) => [
          <code key={item.name} className="text-xs break-all">
            {item.name}
          </code>,
          item.purpose,
        ])}
      />

      <h2>4. Third parties</h2>
      <p>
        We don&apos;t use analytics, advertising, social media plugins or other
        third-party tools that set cookies. Our fonts are served from our own
        domain.
      </p>
      <p>
        If you choose to sign in with Google or GitHub, you briefly visit their
        website, which uses its own cookies under its own policy. Inside the
        app, profile pictures of people who signed in with Google or GitHub load
        from those providers&apos; servers, which see your IP address as with
        any image.
      </p>

      <h2>5. How to manage cookies</h2>
      <p>
        You can see and delete cookies in your browser settings, and block them
        for any site. If you block LamaLama&apos;s cookies, you won&apos;t be
        able to sign in. Signing out ends your session, and deleting your
        account removes your data as described in the{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>6. Contact and changes</h2>
      <p>
        Questions? Write to <a href={`mailto:${legal.email}`}>{legal.email}</a>.
        If we ever add a cookie that needs your consent, we will ask for it
        first, with a choice as easy to refuse as to accept, and update this
        page.
      </p>
    </LegalDocument>
  )
}
