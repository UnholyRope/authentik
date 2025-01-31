import { DEFAULT_CONFIG } from "@goauthentik/common/api/config";
import { dateTimeLocal, first } from "@goauthentik/common/utils";
import "@goauthentik/elements/forms/FormGroup";
import "@goauthentik/elements/forms/HorizontalFormElement";
import { ModelForm } from "@goauthentik/elements/forms/ModelForm";
import "@goauthentik/elements/SearchSelect";
import { UserOption } from "@goauthentik/elements/user/utils";

import { t } from "@lingui/macro";

import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { CoreApi, CoreUsersListRequest, IntentEnum, Token, User } from "@goauthentik/api";

@customElement("ak-token-form")
export class TokenForm extends ModelForm<Token, string> {
    loadInstance(pk: string): Promise<Token> {
        return new CoreApi(DEFAULT_CONFIG).coreTokensRetrieve({
            identifier: pk,
        });
    }

    getSuccessMessage(): string {
        if (this.instance) {
            return t`Successfully updated token.`;
        } else {
            return t`Successfully created token.`;
        }
    }

    send = (data: Token): Promise<Token> => {
        if (this.instance?.identifier) {
            return new CoreApi(DEFAULT_CONFIG).coreTokensUpdate({
                identifier: this.instance.identifier,
                tokenRequest: data,
            });
        } else {
            return new CoreApi(DEFAULT_CONFIG).coreTokensCreate({
                tokenRequest: data,
            });
        }
    };

    renderForm(): TemplateResult {
        return html`<form class="pf-c-form pf-m-horizontal">
            <ak-form-element-horizontal label=${t`Identifier`} name="identifier" ?required=${true}>
                <input
                    type="text"
                    value="${first(this.instance?.identifier, "")}"
                    class="pf-c-form-control"
                    required
                />
                <p class="pf-c-form__helper-text">
                    ${t`Unique identifier the token is referenced by.`}
                </p>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal label=${t`User`} ?required=${true} name="user">
                <!-- @ts-ignore -->
                <ak-search-select
                    .fetchObjects=${async (query?: string): Promise<User[]> => {
                        const args: CoreUsersListRequest = {
                            ordering: "username",
                        };
                        if (query !== undefined) {
                            args.search = query;
                        }
                        const users = await new CoreApi(DEFAULT_CONFIG).coreUsersList(args);
                        return users.results;
                    }}
                    .renderElement=${(user: User): string => {
                        return UserOption(user);
                    }}
                    .value=${(user: User | undefined): number | undefined => {
                        return user ? user.pk : undefined;
                    }}
                    .selected=${(user: User): boolean => {
                        return user.pk === this.instance?.user;
                    }}
                    ?blankable=${true}
                >
                </ak-search-select>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal label=${t`Intent`} ?required=${true} name="intent">
                <select class="pf-c-form-control">
                    <option
                        value=${IntentEnum.Api}
                        ?selected=${this.instance?.intent === IntentEnum.Api}
                    >
                        ${t`API Token (can be used to access the API programmatically)`}
                    </option>
                    <option
                        value=${IntentEnum.AppPassword}
                        ?selected=${this.instance?.intent === IntentEnum.AppPassword}
                    >
                        ${t`App password (can be used to login using a flow executor)`}
                    </option>
                </select>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal label=${t`Description`} name="description">
                <input
                    type="text"
                    value="${first(this.instance?.description, "")}"
                    class="pf-c-form-control"
                />
            </ak-form-element-horizontal>
            <ak-form-element-horizontal name="expiring">
                <div class="pf-c-check">
                    <input
                        type="checkbox"
                        class="pf-c-check__input"
                        ?checked=${first(this.instance?.expiring, true)}
                    />
                    <label class="pf-c-check__label"> ${t`Expiring?`} </label>
                </div>
                <p class="pf-c-form__helper-text">
                    ${t`If this is selected, the token will expire. Upon expiration, the token will be rotated.`}
                </p>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal label=${t`Expires on`} name="expires">
                <input
                    type="datetime-local"
                    data-type="datetime-local"
                    value="${dateTimeLocal(first(this.instance?.expires, new Date()))}"
                    class="pf-c-form-control"
                />
            </ak-form-element-horizontal>
        </form>`;
    }
}
