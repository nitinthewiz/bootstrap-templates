	var Q = require( 'q' ),
	fs = require('fs'),
	request = require('request'),
	cheerio = require('cheerio');

	var app = {};

	app.outputFile = '../data/data.json';

	app.numberOfPagesScraped = 0;

	app.pageScrapeStartTime = [];

	app.results = [];

	app.queue = [];

	app.debug = true;

	app.days_of_the_week = [
								'Mon',
								'Tue',
								'Wen',
								'Thur',
								'Fri',
								'Sat',
								'Sun',
							];

	app.run = function(){

		fs.unlink( app.outputFile, function(){ console.log( '--deleting old output file--' ); });

		var result = Q('a');

		app.pages.forEach( function( element, index, array ){

			app.page = app.pages[ index ];

			app.currentPageIndex = index;

			result = result.then( app.scrape_page );

		});
	};

	app.cleanse = function( data ){
		return data.replace(/\t/g, '').replace(/\n/g, '').trim();
	};

	app.getValue = function( thisElement, data_point, child ){

		var result = '';

		// check if attr is provided
		if ( typeof data_point.attribute == 'undefined' )
		{
			result = thisElement.find( data_point.element ).eq( child ).text();
		}
		else
		{
			result = thisElement.find( data_point.element ).eq( child ).attr( data_point.attribute );
		}

		// if the 1st char is '/', append the baseUrl
		if ( result.charAt( 0 ) ==  '/' && typeof app.baseUrl !== undefined )
		{
			result = app.baseUrl + result;
		}

		return result;
	}

	app.setChild = function( data_point ){
		var child = 0;

		// check if child is provided
		if ( typeof data_point.child !== 'undefined' )
		{
			child = data_point.child;
		}

		return child;
	};

	app.getFromAnotherPage = function( sub_data, child, resultIndex ){

		sub_url = app.getValue( thisElement, sub_data, child );

		var elements_from_second_page = {};

		var deferred = Q.defer();

		request.get( sub_url, function(sub_error, sub_response, sub_html){

			if(! sub_error)
			{
				var $$ = cheerio.load( sub_html );

				$$( 'body' ).first().each(function( sub_i, sub_elem ) {

					var subElement = $$(this);

					for ( var sub_data_point in sub_data.data_points )
					{
						var child = app.setChild( sub_data.data_points[ sub_data_point ] );

						// if it is a function, execute it
						if( typeof sub_data.data_points[ sub_data_point ] == 'function' )
						{
							resultIndex[ sub_data_point ] = sub_data.data_points[ sub_data_point ]( subElement );
						}
						// if it is an object, do the dew
						else if( typeof sub_data.data_points[ sub_data_point ] == 'object')
						{
							resultIndex[ sub_data_point ] =
								app.getValue( subElement, sub_data.data_points[ sub_data_point ], child );
						}
						else
						{

							var temp = subElement.find( sub_data.data_points[ sub_data_point ] ).text();

							temp = app.cleanse( temp.trim() );

							resultIndex[ sub_data_point ] = temp;
						}
					}

				});

				process.stdout.write( '+' );

				deferred.resolve( resultIndex );
			}

		});

		return deferred.promise;
	};

	app.cleanResults = function( results ){

		console.log( results );

		// if there is another page to scrape, remove array-end
		if( typeof app.nextUrl !== 'undefined' ){

			//results = results.replace( "\n]", ',' );
		}

		// if this isn't the first json response, remove array-beginning
		if( app.numberOfPagesScraped != 1 ){

			//results = results.replace("[\n", '');
		}

		return results;
	};

	app.scrape_page = function(){

		var instance_json = {};

		request.get( app.page.url, function(error, response, html){

			if(!error)
			{
				// increment the counter;
				app.numberOfPagesScraped++;

				app.pageScrapeStartTime[ app.numberOfPagesScraped ] = new Date().getTime();

				var $ = cheerio.load(html);

				var results = [];

				// indicator that a parent page is being scraped
				process.stdout.write( '.' );

				//app.nextUrl = app.page.next_url( $('body') );

				app.baseUrl = app.page.base_url;

				// find all matches on the page for the provided class and loop
				$( app.page.find_every ).each(function( i, elem ) {

					results[ i ] = {};

					thisElement = $(this);

					for ( var this_data_point in app.page.data_points )
					{
						if( typeof app.page.data_points[ this_data_point ] == 'object')
						{
							var child = app.setChild( app.page.data_points[ this_data_point ] );

							// this is a sub_page, make another request via getFromAnotherPage
							if( this_data_point == 'from_another_page' )
							{
								app.queue.push(
													app.getFromAnotherPage(
																	// the sub_data_point
																	app.page.data_points[ this_data_point ],
																	child, // child
																	results[i]
																)
												);
							}
							else{
								// it is not a sub page, just get the value the standard way
								results[ i ][ this_data_point ] = app.getValue( thisElement, app.page.data_points[ this_data_point ], child );
							}
						}
						else if( typeof app.page.data_points[ this_data_point ] == 'function' )
						{
							results[ i ][ this_data_point ] = app.page.data_points[ this_data_point ]( thisElement );
						}
						else
						{
							results[ i ][ this_data_point ] =
								app.cleanse( thisElement.find( app.page.data_points[ this_data_point ] ).text() );
						}
					}
				
				});

				Q.all( app.queue ).then(function(ful) {

					console.log( 'did first page ' );
					console.log( results );
					
					exit;
					
					if( ( app.currentPageIndex + 1 ) == app.pages.length )
					{
						/* Write to file */
						fs.appendFile(
										app.outputFile,
									  	app.cleanResults( JSON.stringify( results, null, 2) ),
									  	function(err){

											var end_time = new Date().getTime();
											var duration = ( end_time - app.start_time ) / 1000;
											var current_page_duration = ( end_time -
																		 	app.pageScrapeStartTime[ app.numberOfPagesScraped ] 
																		) / 1000;
											console.log();

											console.log( 
															'Scraping duration: ' + 
															current_page_duration + 
															' / ' + 
															( duration ) +
															' seconds' 
														);
						});

					}
					else
					{
						console.log( 'current_index : '+ app.currentPageIndex );
						console.log( 'max: ' + app.pages.length );
					}

				}, function(rej) {
					
					console.log( rej );
				
				}).fail(function(err) {
					
				  console.log('fail', err);
				
				}).fin(function(ful){
					
					// empty line
					console.log( );
				
				});
			}
			else{
				console.log();
				console.log( '------------------------' );
				console.log( 'Request for main page was unsuccessful.' );
				console.log( error );
				console.log( '------------------------' );
				console.log();
			}
		});
	};
	
	module.exports = app;
