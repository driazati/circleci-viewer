// Stateless functions to get info about a 'div.merge-status-item' CI build

function get_build_info(element) {
	let link = element.querySelector('.status-actions').href;
	return {
		link: link,
		id: get_build_id(link)
	};
}

function get_status(merge_status_item) {
	let svg = merge_status_item.querySelector('div.merge-status-icon').querySelector('svg');

	if (svg.classList.contains('octicon-x')) {
		return 'failed';
	} else if (svg.classList.contains('octicon-primitive-dot')) {
		return 'pending';
	} else if (svg.classList.contains('octicon-check')) {
		return 'success';
	} else {
		console.error("Unknown merge status on", merge_status_item);
	}
}

function get_detail_element(merge_status_item) {
	let links = merge_status_item.querySelectorAll('a');
	for (let i = 0; i < links.length; i++) {
		if (links[i].innerText === "Details") {
			return links[i];
		}
	}

	return undefined;
}

function get_build_id(link) {
	if (!link) {
		return;
	}
	let match = link.match(/\d+(?=\?)/g);
	if (!match || match.length != 1) {
		return;
	}
	return match[0];
}

function get_job_owner(link) {
	// It's something like:
	// https://circleci.com/gh/pytorch/pytorch/2288196?utm_campaign...

	let match = link.match(/circleci\.com\/gh\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/);

	if (!match) {
		// console.error("Couldn't username/repo for link ", link);
		return {
			username: undefined,
			repo: undefined,
		};
	}

	return {
		username: match[1],
		repo: match[2],
	};
}

function get_builds(merge_status_list) {
	return iterable_map(merge_status_list.querySelectorAll('.merge-status-item'),
		(merge_status_item) => get_build(merge_status_item));
}

function get_build(merge_status_item) {
	let link = merge_status_item.querySelector('.status-actions');
	if (!link) {
		return;
	}
	link = link.href;

	// Find the username and repo for the build
	let detail = get_detail_element(merge_status_item);
	let username = undefined;
	let repo = undefined;
	if (detail) {
		let owner = get_job_owner(detail.href);
		username = owner.username;
		repo = owner.repo;
	}

	return {
		element: merge_status_item,
		name: merge_status_item.querySelector('strong').innerText.trim(),
		link: link,
		id: get_build_id(link),
		username: username,
		repo: repo,
		status: get_status(merge_status_item)
	};	
}