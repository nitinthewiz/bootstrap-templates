	var scraper = require( './scraper.js' );

	scraper.start_time = new Date().getTime();

	scraper.pages =
	[
		{
			'url': 'http://startbootstrap.com/template-categories/all/',

			'name': 'StartBootstrap',

			'base_url' : 'http://startbootstrap.com',

			'next_url' : function(){ },

			'find_every' : '.col-lg-4',

			'data_points' : {

				'source' : function( element ){ return 'http://startbootstrap.com'; },

				'image' : {
					'element' : '.thumbnail a img',
					'attribute' : 'src',
				},

				'name' : '.thumbnail .caption h3',

				'link' : {
					'element' : '.thumbnail .post-image-link',
					'attribute' : 'href',
				},

				'bootstrap_version' : function( element ){ return 3; },


				'from_another_page' : {

					'element' 	: '.thumbnail .post-image-link',

					'attribute' : 'href',

					'data_points' 	: {

						'demo_link' :{
							'element' : 'ul.preview-links li a',
							'attribute' : 'href',
							'child' : 0,
						},

						'download_link' : {
							'element' : 'ul.preview-links li a',
							'attribute' : 'href',
							'child' : 1,
						},

						'description' : '.preview-page-content p',

					},
				},

			}
		},

		{
			'url': 'http://www.prepbootstrap.com/bootstrap-theme',

			'name': 'PrepBootstrap',

			'base_url' : 'http://www.prepbootstrap.com',

			'find_every' : '.pb-template',

			'data_points' : {

				'source' : function( element ){ return 'PrepBootstrap'; },

				'source_link' : function(){ return 'http://www.prepbootstrap.com'; },

				'image' : {
					'element' : '.thumbnail a img',
					'attribute' : 'src',
				},

				'name' : '.thumbnail a h3',

				'link' : {
					'element' : '.thumbnail a',
					'attribute' : 'href',
				},

				'bootstrap_version' : function( element ){ return 3; },


				'from_another_page' : {

					'element' 	: '.thumbnail a',

					'attribute' : 'href',

					'data_points' 	: {

						'demo_link' :{
							'element' : '.container .row .col-md-6 a',
							'attribute' : 'href',
						},

						'download_link' : {
							'element' : '.container .row .col-md-6 .btn-success',
							'attribute' : 'href',
						},

						'description' : {
							'element' :	'.container .row .col-md-12',
							'child' : 2,
						}

					},
				},

			}
		},
	];

	scraper.run();
