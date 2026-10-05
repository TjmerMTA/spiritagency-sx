/**
 * Spirit Models — фильтры галереи, лайтбокс и анимации. Без зависимостей.
 */
(function () {
	'use strict';

	var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	document.addEventListener('DOMContentLoaded', function () {

		/* ---------- Шапка ---------- */
		var header = document.getElementById('sm-header');

		function onScroll() {
			if (header) {
				header.classList.toggle('sm-stuck', (window.scrollY || 0) > 30);
			}
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		/* ---------- Мобильное меню ---------- */
		var burger = document.getElementById('sm-burger');
		var nav = document.getElementById('sm-nav');

		if (burger && nav) {
			burger.addEventListener('click', function () {
				var open = nav.classList.toggle('sm-open');
				burger.classList.toggle('sm-on', open);
				burger.setAttribute('aria-expanded', open ? 'true' : 'false');
				document.body.style.overflow = open ? 'hidden' : '';
			});

			nav.addEventListener('click', function (e) {
				if (e.target.closest('a')) {
					nav.classList.remove('sm-open');
					burger.classList.remove('sm-on');
					burger.setAttribute('aria-expanded', 'false');
					document.body.style.overflow = '';
				}
			});
		}

		/* ---------- Появление блоков ---------- */
		var revs = document.querySelectorAll('.sm-rev');

		if (reduced || !('IntersectionObserver' in window)) {
			revs.forEach(function (el) {
				el.classList.add('sm-in');
			});
		} else {
			var io = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add('sm-in');
						io.unobserve(entry.target);
					}
				});
			}, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });

			revs.forEach(function (el) {
				io.observe(el);
			});
		}

		/* ---------- Фильтр галереи ---------- */
		var gallery = document.getElementById('sm-gallery');
		var filters = document.querySelectorAll('.sm-filter');

		if (gallery && filters.length) {
			var cells = Array.prototype.slice.call(gallery.children);

			filters.forEach(function (btn) {
				btn.addEventListener('click', function () {
					var want = btn.dataset.filter;

					filters.forEach(function (b) {
						b.classList.toggle('sm-on', b === btn);
					});

					cells.forEach(function (cell) {
						var card = cell.classList.contains('sm-face') ? cell : cell.querySelector('.sm-face');
						var format = cell.dataset.format || (card && card.dataset.format) || 'public';
						var match = 'all' === want || format === want;

						if (match) {
							cell.classList.remove('sm-hide');
							window.requestAnimationFrame(function () {
								cell.classList.remove('sm-fade');
							});
						} else {
							cell.classList.add('sm-fade');
							window.setTimeout(function () {
								if (cell.classList.contains('sm-fade')) {
									cell.classList.add('sm-hide');
								}
							}, reduced ? 0 : 200);
						}
					});
				});
			});
		}

		/* ---------- Лайтбокс ---------- */
		var lb = document.getElementById('sm-lb');

		if (lb) {
			var lbImg = lb.querySelector('[data-lb-img]');
			var lbName = lb.querySelector('[data-lb-name]');
			var lbMeta = lb.querySelector('[data-lb-meta]');
			var shots = [];
			var index = 0;

			function collect() {
				shots = Array.prototype.slice
					.call(document.querySelectorAll('.sm-gallery .sm-face[data-full]'))
					.filter(function (el) {
						var cell = el.parentElement;
						return !cell || !cell.classList.contains('sm-hide');
					});
			}

			function show(i) {
				if (!shots.length) {
					return;
				}

				index = (i + shots.length) % shots.length;

				var card = shots[index];

				lbImg.src = card.dataset.full;
				lbImg.alt = card.dataset.name || '';
				lbName.textContent = card.dataset.name || '';
				lbMeta.textContent = card.dataset.meta || '';
			}

			function open(i) {
				collect();
				show(i);
				lb.classList.add('sm-open');
				document.body.style.overflow = 'hidden';
			}

			function close() {
				lb.classList.remove('sm-open');
				document.body.style.overflow = '';
				lbImg.src = '';
			}

			// Клик по значку лупы открывает лайтбокс, клик по карточке — страницу модели.
			document.addEventListener('click', function (e) {
				var zoom = e.target.closest('.sm-face__zoom');

				if (!zoom) {
					return;
				}

				var card = zoom.closest('.sm-face[data-full]');

				if (!card) {
					return;
				}

				e.preventDefault();
				collect();
				open(shots.indexOf(card));
			});

			lb.addEventListener('click', function (e) {
				if (e.target === lb || e.target.closest('[data-lb-close]')) {
					close();
					return;
				}

				if (e.target.closest('[data-lb-prev]')) {
					show(index - 1);
				}

				if (e.target.closest('[data-lb-next]')) {
					show(index + 1);
				}
			});

			document.addEventListener('keydown', function (e) {
				if (!lb.classList.contains('sm-open')) {
					return;
				}

				if ('Escape' === e.key) {
					close();
				}

				if ('ArrowLeft' === e.key) {
					show(index - 1);
				}

				if ('ArrowRight' === e.key) {
					show(index + 1);
				}
			});
		}

		/* ---------- FAQ ---------- */
		document.querySelectorAll('.sm-faq__b').forEach(function (btn) {
			btn.addEventListener('click', function () {
				var item = btn.closest('.sm-faq__i');
				var panel = item.querySelector('.sm-faq__p');
				var open = item.classList.toggle('sm-open');

				btn.setAttribute('aria-expanded', open ? 'true' : 'false');
				panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '';
			});
		});

		/* ---------- Активный пункт меню ---------- */
		var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
		var links = Array.prototype.slice.call(document.querySelectorAll('.sm-nav a[href*="#"]'));

		if (sections.length && links.length && 'IntersectionObserver' in window) {
			var spy = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting) {
						return;
					}

					links.forEach(function (link) {
						if (link.parentElement) {
							link.parentElement.classList.toggle('sm-active', link.hash === '#' + entry.target.id);
						}
					});
				});
			}, { rootMargin: '-45% 0px -50% 0px' });

			sections.forEach(function (section) {
				spy.observe(section);
			});
		}
	});
})();
