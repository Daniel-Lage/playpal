import type { SendVerificationRequestParams } from "next-auth/providers/email";
import { createTransport } from "nodemailer";

export async function sendVerificationRequest({
  identifier,
  url,
  provider: { server, from },
}: SendVerificationRequestParams) {
  const transport = createTransport(server);
  const result = await transport.sendMail({
    to: identifier,
    from: from,
    subject: `Playpal signin request`,
    text: `Sign in to Playpal!\n${url}\n\n`,
    html: `
<body style="background: white">
  <table style="width: 100%; max-width: 600px; margin: auto">
    <tr>
      <td>
        <img
          src="https://4wvt2yai2h.ufs.sh/f/AthAeo31HvfoJWa1OXmxw0IrtU7mzPXejsSq2vRHbgnapu8y"
          alt="Playpal Logo"
          width="150"
        />
      </td>
    </tr>
    <tr>
      <td
        style="
          padding: 10px 0px;
          font-size: 22px;
          font-family: Helvetica, Arial, sans-serif;
          color: black;
        "
      >
        Sign in to <strong>Playpal</strong>
      </td>
    </tr>
    <tr>
      <td
        style="
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 20px 0px;
        "
      >
        <a
          href="${url}"
          target="_blank"
          style="
            align-self: center;
            font-size: 24px;
            font-family: Helvetica, Arial, sans-serif;
            background-color: #bf83fc;
            color: black;
            text-decoration: none;
            border-radius: 5px;
            padding: 20px 30px;
            display: inline-block;
            font-weight: bold;
          "
          >Sign in</a
        >
      </td>
    </tr>
    <tr>
      <td
        style="
          text-align: center;
          padding: 16px 0px;
          font-size: 16px;
          line-height: 22px;
          font-family: Helvetica, Arial, sans-serif;
          color: gray;
        "
      >
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`,
  });
  const failed = result.rejected.concat(result.pending).filter(Boolean);
  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
  }
}
