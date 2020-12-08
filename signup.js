/* =============================================================================
  Copyright (C) 2020 yumetodo <yume-wikijp@live.jp>
  Distributed under the Boost Software License, Version 1.0.
  (See https://www.boost.org/LICENSE_1_0.txt)
============================================================================= */
// @ts-check
/**
 *
 * @param {EventListenerOrEventListenerObject} loaded
 */
function ready(loaded) {
	if (["interactive", "complete"].includes(document.readyState)) {
		loaded();
	} else {
		document.addEventListener("DOMContentLoaded", loaded);
	}
}
ready(() => {
	const apiServer = "http://127.0.0.1:3000";
	const href = window.location.href;
	/**
	 *
	 * @param {HTMLElement} srcElement
	 * @param {HTMLElement} destElement
	 */
	const assumeInputMatch = (srcElement, destElement) => {
		srcElement.addEventListener("input", e => {
			if (!(e.target instanceof HTMLInputElement)) return;
			destElement.setAttribute("pattern", `^${e.target.value}$`);
		});
	};
	const idError = document.getElementById("idError");
	const mailAddressError = document.getElementById("mailAddressError");
	/** @type {HTMLInputElement} */
	const icon = document.getElementById("icon");
	const iconError = document.getElementById("iconError");
	/**
	 *
	 * @param {unknown} errors
	 */
	const setServerError = errors => {
		if (typeof errors !== "object") return;
		if (typeof errors.id === "string") {
			idError.innerText = errors.id;
		}
		if (typeof errors.mailaddress === "string") {
			mailAddressError.innerText = errors.mailaddress;
		}
		if (typeof errors.icon === "string") {
			iconError.innerText = errors.icon;
		}
	};
	const clearServerError = () => {
		idError.innerHTML = "英数字もしくは<code>_</code>を6文字以上入力してください";
		mailAddressError.innerText = "有効なメールアドレスではありません";
		iconError.innerText = "";
	};
	/**
	 *
	 * @param {string} postData
	 */
	const postFormData = postData => {
		return fetch(`${apiServer}/producers`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			mode: "cors",
			body: postData,
		}).then(async r => {
			if (r.status === 201) {
				const url = new URL(href);
				url.pathname = "/confirm_mailaddress.html";
				const param = new URLSearchParams();
				param.set("from_ui", await r.text());
				url.search = `?${param}`;
				window.location.href = url.href;
			} else if (r.status === 404) {
				setServerError(await r.json());
			} else {
				throw new Error(`HTTP Status Code: ${r.status}, responce body: ${await r.text()}`);
			}
		});
	};
	/**
	 *
	 * @param {File} file
	 * @returns {Promise<string | null>}
	 */
	const postIcon = file => {
		return fetch(`${apiServer}/image`, {
			method: "POST",
			headers: {
				"Content-Type": "application/octet-stream",
			},
			mode: "cors",
			body: file,
		}).then(async r => {
			if (r.status === 200) {
				return r.text();
			} else if (r.status === 400 || r.status === 401 || r.status === 415) {
				iconError.innerText = await r.text();
				return null;
			} else {
				throw new Error(`HTTP Status Code: ${r.status}, responce body: ${await r.text()}`);
			}
		});
	};
	/**
	 * collect all input value except retype field and convert it to JSON
	 * @param {HTMLFormElement} form
	 * @param {string} iconId
	 */
	const createPostData = (form, iconId) => {
		const f = Array.from(form);
		const obj = Object.fromEntries(
			f
				.filter(
					/**
					 * @returns {e is HTMLInputElement}
					 */
					e => e instanceof HTMLInputElement && e.id !== "passretype"
				)
				.map(e => (e.id === "icon" ? ["icon", iconId] : [e.id, e.value]))
		);
		obj.name += f.filter(
			/**
			 * @returns {e is HTMLSelectElement}
			 */
			e => e instanceof HTMLSelectElement && e.id === "position"
		)[0].value;
		return JSON.stringify(obj);
	};
	/**
	 *
	 * @param {HTMLFormElement} form
	 */
	const onSubmit = async form => {
		clearServerError();
		if (icon.files.length !== 1) return;
		return postIcon().then(icId => {
			if (icId != null) {
				return postFormData(createPostData(form, icId));
			}
		});
	};

	bsCustomFileInput.init();
	const pass = document.getElementById("pass");
	const passretype = document.getElementById("passretype");
	assumeInputMatch(pass, passretype);
	clearServerError();
	for (const form of document.forms) {
		form.addEventListener("submit", e => {
			e.preventDefault();
			e.stopPropagation();
			form.classList.add("was-validated");
			if (form.checkValidity()) {
				onSubmit(form).catch(er => console.error(er));
			}
		});
	}
});
