<?php

include 'simple_dom.php';

class Scraper {

	public $templates = [];

	public $json_file = '../data/data.json';

	public function __construct()
	{
		$start_time = time();

		$this->manualFinds();
		$this->blacktie();
		$this->startBootstrap();
		$this->bootswatch();
		$this->prepBootstrap();

		$this->save();

		echo "\n Elapsed Time: " . ( time() - $start_time )." seconds \n";

		echo "\n\n";
	}

	public function save()
	{
		if( 
			file_put_contents( 
				$this->json_file, 
				json_encode( $this->templates )
			) 
		  )
		{
			echo "Done!";
		}
		else{
			echo "Uh oh. Data wasn't written to file. \n\n\n";
		}


	}

	public function defaultScraper(
									$scrape_url,
								   	$base_url,
									$source,
									$base_element,
									$template_attribute_class,
									$bootstrap_version = 3
								)
	{
		$home_page = file_get_html( $scrape_url );

		foreach( $home_page->find( $base_element ) as $element )
		{
			$template['source_link'] = $base_url;
			$template['image'] = $base_url . $element->find( $template_attribute_class['image'] )[0]->src;
			$template['name'] = $element->find( $template_attribute_class['name'] )[0]->plaintext ;
			$template['link'] = $base_url . $element->find( $template_attribute_class['link'] )[0]->href ;
			$template['source'] = $source;

			// get description text from template page 
			$template_page = file_get_html( $template['link'] );
			$template['description'] = '';

			foreach( $template_attribute_class['description'] as $description_class => $description_result_number )
			{
				$template['description'] .= $template_page->find( $description_class )[ $description_result_number ]->plaintext;
			}

			$template['bootstrap_version'] = $bootstrap_version;

			if( isset( $template_attribute_class['demo_on_home_page'] ) )
			{
				$template['demo_link'] = $base_url . $element->find( $template_attribute_class['demo'] )[0]->href;
			}
			else
			{
				$template['demo_link'] = $base_url . 
					$template_page->find( $template_attribute_class['demo'] )[0]->href;
			}

			if( isset( $template_attribute_class['download_on_home_page'] ) )
			{
				$template['download_link'] = $base_url . 
					$element->find( $template_attribute_class['download']['class'] )
						[$template_attribute_class['download']['result_number']]->href;
			}
			else
			{
				$template['download_link'] = $base_url . 
					$template_page->find( $template_attribute_class['download']['class'] )
						[$template_attribute_class['download']['result_number']]->href;
			}

			$this->templates[]= $template;

			echo ".";
		}
	}

	public function startBootstrap()
	{
		$this->defaultScraper(
			'http://startbootstrap.com/template-categories/all/',
			'http://startbootstrap.com',
			'StartBootstrap',
			'.col-lg-4',
			[
				'image' => '.thumbnail a img',
				'name' 	=> '.thumbnail .caption h3',
				'link'	=> '.thumbnail .post-image-link',
				'demo'  => 'ul.preview-links li a',
				'download'  => [
					'class' => 'ul.preview-links li a',
					'result_number' => 1,
				],
				'description' => [ 
					'.preview-page-content p' => 0
				],
			]

		);
	}

	public function prepBootstrap()
	{
		$this->defaultScraper(
			'http://www.prepbootstrap.com/bootstrap-theme',
			'http://www.prepbootstrap.com',
			'PrepBootstrap',
			'.pb-template',
			[
				'image' => '.thumbnail a img',
				'name' 	=> '.thumbnail a h3',
				'link'	=> '.thumbnail a',
				'demo'  => '.container .row .col-md-6 a',
				'download'  => [
					'class' => '.container .row .col-md-6 .btn-success',
					'result_number' => 0,
				],
				'description' => [
					'.container .row .col-md-12' => 2
				],
			]

		);
	}

	public function bootswatch()
	{

		$this->defaultScraper(
			'http://bootswatch.com/',
			'http://bootswatch.com/',
			'Bootswatch',
			'.section-preview .container .col-sm-6',
			[
				'image' => '.preview .image a img',
				'name' 	=> '.preview .options h3',
				'link'	=> '.preview .image a',
				'demo_on_home_page' => 1,
				'demo'  => '.preview .options a',
				'download_on_home_page' => 1,
				'download'  => [
					'class' => '.preview .options a',
					'result_number' => 1,
				],
				'description' => [
					'.container .page-header .row .col-lg-8 p' => 0
				],
			]

		);
	}

	public function blacktie()
	{
		// Create DOM from URL or file
		$html[] = file_get_html( 'http://www.blacktie.co/' );
		$html[] = file_get_html( 'http://www.blacktie.co/page/2/' );
		$html[] = file_get_html( 'http://www.blacktie.co/page/3/' );
		$source = 'Blacktie';

		// each page on site
		foreach( $html as $page )
		{
			// each post url on page
			foreach( $page->find('article') as $element ) 
			{

				preg_match_all('!\d+!', $element->id, $matches );

				$parsed_url = 'http://www.blacktie.co/?p=' . $matches[0][0];

				$template_page = file_get_html( $parsed_url );

				$template['source_link'] = 'http://www.blacktie.co/';

				$template['source'] = $source;

				$template['image'] = $template_page->find( 'img.wp-post-image' )[0]->src;

				$template['name'] = $template_page->find( 'h1.entry-title' )[0]->plaintext;
				
				if ( $template['name'] == 'Thank you all' )
				{
					unset( $template_page, $template );
					continue;
				}

				$template['link'] = $element->find( 'h1.entry-title a' )[0]->href;

				$template['description'] = [];

				foreach(  $template_page->find( 'div.entry-content p' ) as $p )
				{
					if( strpos($p->plaintext, 'Live Demo') )
					{
						$template['demo_link'] = $p->find( 'a' )[0]->href;
					}
					elseif( in_array( $p->plaintext, [ 'Download', 'Download Now', ] ) )
					{
						$template['download_link'] = $p->find( 'a' )[0]->href;
					}
					elseif ( stristr( $p->plaintext, 'Framework Used') )
					{
						preg_match_all('!\d+!', $p->plaintext, $bootstrap_version );

						$template['bootstrap_version'] = $bootstrap_version[0][0];
					}
					else
					{
						$template['description'] .= $p->plaintext ;
					}
				}

				$this->templates[]= $template;

				unset( $template_page, $template );

				echo ".";
			}
		}
	}

	public function manualFinds()
	{
		$templates[] = [
			'source' => 'Elliot Hesp',
			'source_link' => 'https://github.com/Ehesp/',
			'image' => 'http://i.imgur.com/MRzDg7x.jpg',
			'name' => 'AngularJS + Bootstrap Responsive Dashboard',
			'link' => 'https://github.com/Ehesp/Responsive-Dashboard',
			'demo_link' => 'http://ehesp.github.io/Responsive-Dashboard/',
			'download_link' => 'https://github.com/Ehesp/Responsive-Dashboard/archive/master.zip',
			'description' => 'This dashboard front-end was created as I was lacking a simple responsive but slick looking dashboard for another project of mine. Other free dashboards were bloated with external plugins and required a lot of hackery out of the box - plus the fact many were powered by jQuery. The design takes inspiration from other dashboards around, but the code to create the layout is my own. Feel free to chop it up as much as you want.',
			'bootstrap_version' => 3

		];
		
		foreach( $templates as $template )
		{
			$this->templates[]= $template;
		}
	}
}

new Scraper;