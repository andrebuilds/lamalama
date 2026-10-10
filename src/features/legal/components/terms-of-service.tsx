import Link from "next/link"

import { site } from "@/shared/config/site"

import { legal } from "../lib/legal"
import { LegalDocument } from "./legal-document"

/**
 * Terms of Service, including what the EU Digital Services Act asks of a
 * hosting service (Art. 11, 12, 16 and 17 DSA).
 */
export function TermsOfService() {
  return (
    <LegalDocument
      title="Terms of Service"
      intro={
        <p>
          The rules for using LamaLama at lamalama.video. By creating an account
          or using the service, you agree to them.
        </p>
      }
    >
      <h2>1. Who we are</h2>
      <p>
        LamaLama is run by {legal.controller}, an individual based in{" "}
        {legal.country} (&quot;we&quot;, &quot;us&quot;). Contact:{" "}
        <a href={`mailto:${legal.email}`}>{legal.email}</a>. How we handle
        personal data is explained in the{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>2. The service</h2>
      <p>
        LamaLama is a video editor for product videos: you record or upload
        screen recordings, optionally let AI draft a first cut, edit it and
        export a video. The hosted service is currently free. If we ever
        introduce paid plans, we will tell you in advance and nothing will be
        charged without your explicit agreement.
      </p>
      <p>
        The service is still young and is provided &quot;as is&quot;: features
        may change, and we can&apos;t promise it will always be available or
        free of errors. Keep your own copies of anything important.
      </p>

      <h2>3. Your account</h2>
      <ul>
        <li>You must be at least 16 years old.</li>
        <li>
          Give a real email address and keep access to it: it&apos;s how you
          sign in.
        </li>
        <li>
          You are responsible for what happens in your account and in the
          workspaces you own, including what members you invite do there.
        </li>
        <li>
          Tell us at <a href={`mailto:${legal.email}`}>{legal.email}</a> if you
          think someone else is using your account.
        </li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>Don&apos;t use LamaLama to:</p>
      <ul>
        <li>
          upload or share illegal content, or content that infringes other
          people&apos;s rights (copyright, trademarks, privacy, image rights);
        </li>
        <li>
          harass, threaten or deceive people, including misleading advertising;
        </li>
        <li>spread malware or phishing;</li>
        <li>
          try to break, overload or get around the security of the service, or
          access other people&apos;s accounts or data;
        </li>
        <li>
          use automated tools to create accounts or scrape the service, or
          resell the hosted service without our permission.
        </li>
      </ul>

      <h2>5. Your content</h2>
      <p>
        You keep all rights to what you upload and create. You give us only the
        permission we need to run the service for you: to store, process, render
        and show your content to you, your workspace members and the people you
        send share links to. This permission ends when you delete the content,
        apart from backup copies, which disappear within 30 days.
      </p>
      <p>You are responsible for your content, and in particular:</p>
      <ul>
        <li>
          you need the rights to everything you upload, such as logos, fonts,
          music and screenshots of other products;
        </li>
        <li>
          recordings can contain other people&apos;s personal data (names,
          emails, messages on screen): blur them or record only what you are
          allowed to share. For that data, you are the controller;
        </li>
        <li>
          the claims in your videos must be true: you are responsible for your
          advertising.
        </li>
      </ul>
      <p>
        We don&apos;t look through your content and we don&apos;t claim any
        rights to it.
      </p>

      <h2>6. AI features and your key</h2>
      <p>
        The AI features run on Anthropic Claude through the API key the
        workspace adds. Your key, your bill: Anthropic charges its account for
        the usage, under its own terms, and we are not responsible for those
        costs. Keep a spending limit on your key. AI output can be wrong,
        incomplete or similar to other people&apos;s content: review every
        script and cut before you publish it.
      </p>

      <h2>7. Share links</h2>
      <p>
        A share link lets anyone who has it watch that video, without an
        account. Share links are hidden from search engines, but they work for
        whoever gets the address. Turn a link off when you no longer need it.
      </p>

      <h2>8. Open source</h2>
      <p>
        LamaLama&apos;s code is published on{" "}
        <a href={site.repo} target="_blank" rel="noreferrer">
          GitHub
        </a>{" "}
        under the MIT License, which governs the code. These terms govern only
        the hosted service at lamalama.video. The name and logo are not covered
        by the code license.
      </p>

      <h2>9. Reporting illegal content</h2>
      <p>
        Under the EU Digital Services Act, our single point of contact for
        users, authorities and the European Commission is{" "}
        <a href={`mailto:${legal.email}`}>{legal.email}</a>. You can write in
        English or Italian.
      </p>
      <p>To report content you believe is illegal, include:</p>
      <ul>
        <li>the exact address (URL) of the content;</li>
        <li>why you believe it is illegal;</li>
        <li>
          your name and email address (not required for child abuse material);
        </li>
        <li>
          a statement that you believe, in good faith, that the report is
          accurate and complete.
        </li>
      </ul>
      <p>
        We confirm we received the report, look at it promptly and with care,
        and tell you what we decided. If we remove or restrict content or an
        account, we tell the person affected why and how they can contest the
        decision, by replying to us or before a court. We don&apos;t use
        automated tools to moderate content. We may suspend people who often
        upload clearly illegal content or often send clearly unfounded reports.
      </p>

      <h2>10. Suspension and closing your account</h2>
      <p>
        You can delete your account at any time in Settings. We may suspend or
        close an account that seriously or repeatedly breaks these terms or the
        law, or puts the service or other people at risk. Unless the law or the
        risk prevents it, we warn you first and give you time to download your
        videos.
      </p>
      <p>
        We may stop the service altogether. If we do, we give at least 30
        days&apos; notice by email so you can export your content.
      </p>

      <h2>11. Liability</h2>
      <p>
        We do our best to keep LamaLama working and your data safe, but as a
        free service run by an individual, we are not liable for indirect
        losses, such as lost profits or lost business, or for losing content you
        didn&apos;t back up, as far as the law allows. Nothing in these terms
        limits liability for intent or gross negligence (art. 1229 of the
        Italian Civil Code), for death or personal injury, or any right that
        consumer protection law gives you and that can&apos;t be waived.
      </p>

      <h2>12. Changes to these terms</h2>
      <p>
        We may update these terms when the service or the law changes. For
        important changes, we tell you by email or in the app at least 15 days
        before they apply. If you don&apos;t agree, you can delete your account
        before then; if you keep using LamaLama, the new terms apply.
      </p>

      <h2>13. Law and disputes</h2>
      <p>
        These terms are governed by Italian law. If you are a consumer, you keep
        the protection of the mandatory rules of the country where you live, and
        you can bring a claim before the courts of your place of residence.
        Before going to court, please write to us: most problems can be solved
        with an email.
      </p>
    </LegalDocument>
  )
}
