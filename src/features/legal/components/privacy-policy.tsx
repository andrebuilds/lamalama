import Link from "next/link"

import { legal, providers } from "../lib/legal"
import { LegalDocument, LegalTable } from "./legal-document"

/** Privacy Policy: the information GDPR Articles 13 and 14 require. */
export function PrivacyPolicy() {
  return (
    <LegalDocument
      title="Privacy Policy"
      intro={
        <p>
          What personal data LamaLama collects, why, who else sees it and how
          you stay in control. Short version: only what the app needs to work.
          No ads, no tracking, nothing sold.
        </p>
      }
    >
      <h2>1. Who is responsible</h2>
      <p>
        The data controller is {legal.controller}, an individual based in{" "}
        {legal.country}, who runs the LamaLama service at lamalama.video (
        &quot;LamaLama&quot;, &quot;we&quot;, &quot;us&quot;). For anything
        about your data, write to{" "}
        <a href={`mailto:${legal.email}`}>{legal.email}</a>. We have not
        appointed a Data Protection Officer: the law doesn&apos;t require one
        for a service of this size.
      </p>
      <p>
        LamaLama&apos;s code is open source. This policy covers only the hosted
        service at lamalama.video: if you run your own copy, you are the
        controller of the data it processes.
      </p>

      <h2>2. What we collect</h2>
      <h3>Your account</h3>
      <ul>
        <li>
          Name, email address and profile picture. With Google or GitHub sign-in
          they come from that provider; with an email link, only the email. You
          can change your name and picture in Settings.
        </li>
        <li>
          The access tokens Google or GitHub give us when you sign in with them,
          stored encrypted. We use them only to sign you in.
        </li>
        <li>
          Your sessions: when they start and expire, the IP address and the
          browser (user agent) they were opened from.
        </li>
      </ul>
      <h3>Your workspaces</h3>
      <ul>
        <li>
          What you create or upload: screen recordings, brand kits, logos,
          product descriptions, video projects, exported videos and share links.
        </li>
        <li>
          Workspace members and invitations, including the email address of the
          people you invite.
        </li>
        <li>
          The workspace&apos;s AI provider key, if you add one, stored
          encrypted.
        </li>
      </ul>
      <p>
        Screen recordings can show anything that was on screen, including other
        people&apos;s personal data. Please record only what you are allowed to
        share (see the <Link href="/terms">Terms</Link>).
      </p>
      <h3>Technical data</h3>
      <ul>
        <li>
          Server logs (IP address, requested page, time, errors), kept to run
          and protect the service.
        </li>
        <li>
          Counters that limit how often an action can be repeated, such as
          sign-in attempts, to stop abuse. They are tied to your IP address,
          your account or a hash of your email address.
        </li>
        <li>
          A few cookies and browser storage items, all necessary for the app to
          work. The <Link href="/cookies">Cookie Policy</Link> lists every one
          of them.
        </li>
      </ul>
      <p>
        We don&apos;t use analytics, advertising or tracking tools, and we
        don&apos;t ask for special categories of data (health, religion,
        politics and so on).
      </p>

      <h2>3. Why, and on what legal basis</h2>
      <LegalTable
        head={["Purpose", "Legal basis (GDPR)"]}
        rows={[
          [
            "Creating your account, signing you in, running your workspaces, processing and exporting your videos, sending sign-in links and invitations.",
            "Performance of the contract with you: the Terms (Art. 6(1)(b)).",
          ],
          [
            "Keeping the service secure and available: sessions, logs, rate limits, preventing abuse and fixing errors.",
            "Our legitimate interest in a secure, working service (Art. 6(1)(f)).",
          ],
          [
            "Answering reports of illegal content and requests from authorities, keeping records the law requires.",
            "Legal obligations (Art. 6(1)(c)).",
          ],
          [
            "Defending or exercising legal claims.",
            "Legitimate interest (Art. 6(1)(f)).",
          ],
        ]}
      />
      <p>
        Giving us your email address is necessary to have an account: without it
        we can&apos;t provide the service. Everything else you upload is up to
        you. We don&apos;t make decisions about you based solely on automated
        processing (Art. 22 GDPR) and we don&apos;t profile you.
      </p>

      <h2>4. AI features</h2>
      <p>
        LamaLama can analyse your recordings and draft scripts with Anthropic
        Claude, using the AI key the workspace adds (&quot;bring your own
        key&quot;). When you use these features, the relevant frames, text and
        product details are sent to Anthropic under that key and that
        account&apos;s terms. We don&apos;t send your content to any AI provider
        without a workspace key, and we don&apos;t use it to train models.
      </p>

      <h2>5. Who else processes your data</h2>
      <p>
        These providers process data on our behalf, under data processing
        agreements, and only to run LamaLama:
      </p>
      <LegalTable
        head={["Provider", "What for", "Where"]}
        rows={providers.map((provider) => [
          <a
            key={provider.name}
            href={provider.url}
            target="_blank"
            rel="noreferrer"
          >
            {provider.name}
          </a>,
          provider.role,
          provider.location,
        ])}
      />
      <p>
        If you sign in with Google or GitHub, that provider processes your data
        as an independent controller under its own privacy policy, and your
        profile picture loads from its servers. The same applies to Anthropic
        when a workspace uses its own AI key.
      </p>
      <p>
        Other workspace members see your name, email and picture and the content
        you share in the workspace. Anyone with a share link can watch that
        video. We disclose data to authorities only when the law requires it. We
        never sell or rent personal data.
      </p>

      <h2>6. Transfers outside the EU</h2>
      <p>
        Our data is stored on servers in the European Union. The providers above
        are US companies, so some data may be accessed from the United States,
        for example for support or maintenance. Those transfers rely on the
        EU–US Data Privacy Framework, where the provider is certified, or on the
        European Commission&apos;s Standard Contractual Clauses (Art. 45 and 46
        GDPR). Write to us for a copy of the relevant safeguards.
      </p>

      <h2>7. How long we keep it</h2>
      <ul>
        <li>
          Account and workspace content: until you delete it or your account.
        </li>
        <li>Sessions: until they expire (7 days) or you sign out.</li>
        <li>Sign-in links: 5 minutes. Invitations: 7 days.</li>
        <li>Server logs and database backups: up to 30 days.</li>
        <li>
          Data needed to answer a legal request or defend a claim: as long as
          that requires.
        </li>
      </ul>
      <p>
        When you delete your account, we delete your profile, sessions, sign-in
        connections and the workspaces you own, with their files. In workspaces
        owned by others, the content you created stays with that workspace.
        Copies in backups disappear within 30 days.
      </p>

      <h2>8. How we protect it</h2>
      <ul>
        <li>All traffic is encrypted with HTTPS.</li>
        <li>
          AI keys and sign-in tokens are encrypted at rest with AES-256-GCM.
        </li>
        <li>
          Sign-in links are single-use and stored only as a hash. There are no
          passwords to leak.
        </li>
        <li>
          Files are kept in private storage and reached only through short-lived
          signed links.
        </li>
        <li>Only the controller has administrative access.</li>
      </ul>
      <p>
        If a breach puts your data at risk, we will notify the Italian
        supervisory authority and, where required, you (Art. 33 and 34 GDPR).
      </p>

      <h2>9. Your rights</h2>
      <p>Under the GDPR you can, free of charge:</p>
      <ul>
        <li>access your data and get a copy (Art. 15);</li>
        <li>have it corrected (Art. 16);</li>
        <li>have it deleted (Art. 17);</li>
        <li>restrict its processing (Art. 18);</li>
        <li>receive it in a machine-readable format (Art. 20);</li>
        <li>
          object at any time to processing based on our legitimate interest
          (Art. 21).
        </li>
      </ul>
      <p>
        You can edit your profile and delete your account yourself in Settings.
        For anything else, write to{" "}
        <a href={`mailto:${legal.email}`}>{legal.email}</a>: we answer within
        one month and may ask you to confirm your identity.
      </p>
      <p>
        You also have the right to lodge a complaint with a supervisory
        authority, in particular in the EU country where you live or work. In
        Italy it is the{" "}
        <a
          href="https://www.garanteprivacy.it"
          target="_blank"
          rel="noreferrer"
        >
          Garante per la protezione dei dati personali
        </a>
        , Piazza Venezia 11, 00187 Roma.
      </p>

      <h2>10. Children</h2>
      <p>
        LamaLama is not meant for children: you must be at least 16 to use it.
        If you believe a child gave us personal data, write to us and we will
        delete it.
      </p>

      <h2>11. Google user data</h2>
      <p>
        When you sign in with Google we receive only your basic profile: name,
        email address and profile picture. We use it only to create your account
        and sign you in, and we don&apos;t transfer it to anyone except as
        described in this policy. LamaLama&apos;s use and transfer of
        information received from Google APIs adheres to the{" "}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy"
          target="_blank"
          rel="noreferrer"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements.
      </p>

      <h2>12. Emails</h2>
      <p>
        We only send emails you ask for or need: sign-in links, invitations, and
        important notices about your account or these terms. No newsletters or
        marketing.
      </p>

      <h2>13. Changes</h2>
      <p>
        If this policy changes, we update the date at the top. For important
        changes, we tell you by email or in the app before they apply.
      </p>
    </LegalDocument>
  )
}
