// ==UserScript==
// @name         RomeoEnhancer
// @version      0.89
// @author       braveguy (Romeo: braveguy / Romeo-Club: tbd.)
// @downloadURL  //https://gist.github.com/raw/...
// @description  Enhance the new Romeo site
// @include      https://www.planetromeo.com/*
// @include      https://m.planetromeo.com/*
// @include      https://beta.planetromeo.com/*
// @include      https://bluebird.planetromeo.com/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @grant        GM_addStyle
/*- The @grant directive is needed to work around a design change
    introduced in GM 1.0.   It restores the sandbox.
*/
// @copyright    braveguy 12.10.2016 / 04.06.2017
// ==/UserScript==


/**
 * Copyright(c) by braveguy (Romeo: braveguy / Romeo-Club: tbd.)
 *
 * Modifications and/or reuse of RomeoEnhancer code require my explicit consent.
 * You are NOT allowed to publish any changed version of RomeoEnhancer!
 *
 * All code has been tested with a recent Safari, Firefox, and Chrome browser.
 * However, the use of this script is at your own risk.
 *
 * ** Privacy **
 * RomeoEnhancer does NOT and never will include any code to identify you
 * or spy on your data. There is no commercial interest, no backdoors,
 * no line of code intended to harm you and/or your privacy.
 *
 * The latest version of RomeoEnhancer is always available on:
 * (tbd.)
 */


// ***** Not used:
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js */


// ***** CSS *****
GM_addStyle (
	'a.re-icon {padding:0 8px; font-size:0.85em; color:rgba(255,255,255,0.8)}' +
	'a:hover.re-icon {color:rgba(102,215,255,0.8)}'
);


// ***** Test if alive:
//alert('RomeoEnhancer');


// ***** Find global variables *****
/* (function(){
    var iframe = document.createElement('iframe');
    iframe.src = "about:blank";
    document.body.appendChild(iframe);

    var windowVars = Object.keys(iframe.contentWindow);
    var globalVars = Object.keys(window).filter(key => !windowVars.includes(key));

    console.info("global Vars:", globalVars);
    document.body.removeChild(iframe);
})(); */



// **************************************************************
// ***** The following function is taken from:
// ***** https://gist.github.com/BrockA
// ***** https://gist.github.com/raw/2625891/waitForKeyElements.js


/*--- waitForKeyElements():  A utility function, for Greasemonkey scripts,
    that detects and handles AJAXed content.

    Usage example:

        waitForKeyElements (
            "div.comments"
            , commentCallbackFunction
        );

        //--- Page-specific function to do what we want when the node is found.
        function commentCallbackFunction (jNode) {
            jNode.text ("This comment changed by waitForKeyElements().");
        }

    IMPORTANT: This function requires your script to have loaded jQuery.
*/
function waitForKeyElements (
selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
 actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
 bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
 iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
	var targetNodes, btargetsFound;

	if (typeof iframeSelector == "undefined")
		targetNodes     = $(selectorTxt);
	else
		targetNodes     = $(iframeSelector).contents ()
			.find (selectorTxt);

	if (targetNodes  &&  targetNodes.length > 0) {
		btargetsFound   = true;
		/*--- Found target node(s).  Go through each and act if they
            are new.
        */
		targetNodes.each ( function () {
			var jThis        = $(this);
			var alreadyFound = jThis.data ('alreadyFound')  ||  false;

			if (!alreadyFound) {
				//--- Call the payload function.
				var cancelFound     = actionFunction (jThis);
				if (cancelFound)
					btargetsFound   = false;
				else
					jThis.data ('alreadyFound', true);
			}
		} );
	}
	else {
		btargetsFound   = false;
	}

	//--- Get the timer-control variable for this selector.
	var controlObj      = waitForKeyElements.controlObj  ||  {};
	var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
	var timeControl     = controlObj [controlKey];

	//--- Now set or clear the timer as appropriate.
	if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
		//--- The only condition where we need to clear the timer.
		clearInterval (timeControl);
		delete controlObj [controlKey];
	}
	else {
		//--- Set a timer, if needed.
		if ( ! timeControl) {
			timeControl = setInterval ( function () {
				waitForKeyElements (    selectorTxt,
									actionFunction,
									bWaitOnce,
									iframeSelector
								   );
			},
									   300
									  );
			controlObj [controlKey] = timeControl;
		}
	}
	waitForKeyElements.controlObj   = controlObj;
}

// ***** end
// **************************************************************


// ***** Insert layer *****
function iframeLoad(iframeId, iframeUrl) {
	$('#spotlight-container').append(
		'<div id="' + iframeId + '" class="layer layer--spotlight"><div class="js-layer-content layer__container layer__container--spotlight  l-fancy">' +
		'<div class="js-profile-error"><div><iframe style="border:0;width:928px;height:688px;" src="' + iframeUrl + '"></iframe>' +
		'<a class="js-close-spotlight icon icon-large icon-cross layer__closingx l-tappable--big l-hidden-sm"></a>' +
		'</div></div></div></div>'
	);
}


// ***** Open last selected contacts instead of favourites *****
function keepContacts (jNode) {
	if (window.location.hash.match(/#\/module\/contacts/)) {
		localStorage.setItem('contactsSelection', window.location.hash);
	}
	var contactsPath = localStorage.getItem('contactsSelection');
	contactsPath = (contactsPath ? contactsPath : '#/module/contacts/favourites');
	$('#contacts-menu, a.contacts__search-close').attr('href', contactsPath);
}


// ***** Display selected bookmark in bookmark icon title, versions in header logo title *****
function bookmarkTitle (jNode) {
	var selectedBookmark = $('li.js-bookmarks li.is-selected a').text();
	$('li.js-bookmarks').attr('title', selectedBookmark);
	$('header.site-header h1').attr('title','PlanetRomeo ' + APP_VERSION + '\rRomeoEnhancer ' + GM_info.script.version);
}


// ***** Add forums and classic to radar navigation bar *****
function forumsLink (jNode) {
	$('ul.search-nav__vers-list').append(
		'<li class="ui-navbar__actions-item txt-truncate"><a id="re-forums-link" href="/#/profile/-forums" class="js-nav-item js-vers-list-link ui-navbar__actions-link">Foren</a></li>' +
		'<li class="ui-navbar__actions-item txt-truncate"><a target="romeoclassic" href="https://classic.planetromeo.com" class="js-nav-item ui-navbar__actions-link">Classic</a></li>'
	);
	/*$('#re-forums-link').click(function() {
		iframeLoad('re-forums','https://classic.planetromeo.com/myuser/?page=club&amp;subPage=forum');
	});*/
}


// ***** Add statistics to visitors navigation bar *****
function statisticsLink (jNode) {
	$('#visitors ul.ui-navbar__actions').append(
		'<li class="js-navigation txt-truncate ui-navbar__actions-item"><a href="/#/profile/-statistics" class="ui-navbar__actions-link">Statistik</a></li>'
	);
}


// ***** Display classic forums page in a layer *****
function loadForum (jNode) {
	var frameW = 'width:' + $('#profile--forums section').width() + 'px;';
	var frameH = 'height:' + $('#profile--forums section').height() + 'px;';
	$('#profile--forums section').replaceWith(
		'<iframe style="border:0;' + frameW + frameH + '" src="https://classic.planetromeo.com/myuser/?page=club&amp;subPage=forum"></iframe>'
	);
	$('ul.search-nav__vers-list li a[href="/#/profile/-forums"]').parent().removeClass('is-selected');
}


// ***** Display classic statistics page in a layer *****
function loadStatistics (jNode) {
	var frameW = 'width:' + $('#profile--statistics section').width() + 'px;';
	var frameH = 'height:' + $('#profile--statistics section').height() + 'px;';
	$('#profile--statistics section').replaceWith(
		'<iframe style="border:0;' + frameW + frameH + '" src="https://classic.planetromeo.com/settings/visitorStatistics.php"></iframe>'
	);
	$('ul.search-nav__vers-list li a[href="/#/profile/-statistics"]').parent().removeClass('is-selected');
}


// ***** Preview unread message in title tag *****
function previewMessage (jNode) {
	var profileId, msgCount, jsonParam, thisSpan, msgText;
	$('#messages div.listitem a.js-preview span.txt-bold--medium').not('.hasTitle').each(function(){
		$(this).addClass('hasTitle');
		profileId = $(this).parent().parent().attr('href').match(/\d{3,}/);
		//msgCount = parseInt($(this).find('span.txt-pill--mini').text());
		msgCount = 1;
		jsonParam = 'lang=de&length=' + msgCount + '&filter%5Bfolders%5D%5B%5D=RECEIVED&filter%5Bpartner_id%5D=' + profileId;
		//thisSpan = $(this).find('span.js-preview-text');
		thisSpan = $(this);
		console.info(profileId, msgCount, thisSpan);
		$.get('/api/v4/messages?' + jsonParam).done(function (data) {
			msgText = data.items[0].text;
			$(thisSpan).attr('title', msgText);
		});
	});
}


// ***** Display classic message history in a layer *****
function loadHistory (jNode) {
	var profileId;
	// ... calculate profileId ...
	var frameH = $('#profile--history section').height() + 'px';
	$('#profile--history section').replaceWith(
		'<iframe style="border:0; height:' + frameH + '" src="https://classic.planetromeo.com/msg/history.php?uid=' + profileId + '"></iframe>'
	);
}


// ***** Add message bubbles to contact list entries *****
function messageContacts (jNode) {
	var profileId;
	$('#contacts a.js-preview.listitem__body').each(function() {
		profileId = $(this).attr('href').match(/\d{3,}/);
		$(this).find('span.plain-text-link').not(':has(a)').append(
			'<a style="font-size:0.9em; padding:0 8px" class="icon icon-chat" title="Messages" href="/#/module/messages/'+ profileId + '"></a>'
		);
	});
}


// ***** Add message bubbles to visitor list entries *****
function messageVisitors (jNode) {
	var profileId;
	$('#visitors div.tile').each(function() {
		profileId = $(this).find('a').attr('href').match(/\d{3,}/);
		$(this).find('div.info').not(':has(a)').append(
			'<a class="icon icon-chat re-icon" title="Messages" href="/#/module/messages/' + profileId + '"></a>'
		);
		$(this).find('span.icon-save-contact').replaceWith(
			'<a class="tile__badge icon icon-save-contact" title="Kontakt bearbeiten" href="/#/module/contacts/all/' + profileId + '"</a>'
		);
	});
}


// ***** Add message bubbles to radar tiles and list entries *****
function messageRadar (jNode) {
	var profileId;
	$('#profiles a.tile__link, #profiles a.listresult').each(function() {
		profileId = $(this).attr('href').match(/\d{3,}/);
		$(this).find('div.info, span.info__body').not(':has(a)').append(
			'<a class="icon icon-chat re-icon" title="Messages" href="/#/module/messages/' + profileId + '"></a>'
		);
		$(this).find('span.icon-save-contact').replaceWith(
			'<a class="tile__badge icon icon-save-contact" title="Kontakt bearbeiten" href="/#/module/contacts/all/' + profileId + '"</a>'
		);
		// BMI ...
	});
}


// ***** Add message bubbles to Activity Stream entries (online and footprints only) *****
function messageActivity (jNode) {
	var bodyLink, profileId;
	$('#stream div.listitem').each(function() {
		bodyLink = $(this).find('a.listitem__body').attr('href');
		if (bodyLink.search('/module/messages/') == -1) {
			profileId = $(this).find('a.tile__link').attr('href').match(/\d{3,}/);
			$(this).find('div.layout-item').not(':has(a)').find('span.listitem__text, span.ui-status-description').last().append(
				'<a class="icon icon-chat re-icon" title="Messages" href="/#/module/messages/' + profileId + '"></a>'
			);
			$(this).find('span.listitem__text, span.ui-status-description').attr('style','font-style:italic');
		}
	});
}


// ***** Add links to profiles: clubs, guestbook, save user *****
function linksProfile (jNode) {
	var profileId = $('#spotlight-container div.layer.layer--spotlight').attr('id').match(/\d{3,}/);
	var linkClubs = '<a target="_blank" href="https://classic.planetromeo.com/gemeinsam/php/links/index.php?set=' + profileId + '">Clubs</a>';
	var linkGuestbook = '<a target="_blank" href="https://classic.planetromeo.com/gemeinsam/php/guestbook/lesen.php?empfaenger=' + profileId + '">Gästebuch</a>';
	var linkMarket = '<a target="_blank" href="https://classic.planetromeo.com/market/view.php?userId=' + profileId + '">Anzeigen</a>';
	var linkSaveUser = '<a target="_blank" href="https://classic.planetromeo.com/gemeinsam/php/myuser/index.php?partnerId=' + profileId + '">User speichern</a>';
	$('div.profile-stats').prepend('<div style="padding-left:16px;font-size:0.9em"><br/>Classic:&nbsp' + linkClubs + '&nbsp;|&nbsp;' + linkGuestbook + '&nbsp;|&nbsp;' + linkMarket + '&nbsp;|&nbsp;' + linkSaveUser + '</div>');
}


// ***** Add links to error page: save profile etc. *****
function linksError (jNode) {
	var profileId = $('#spotlight-container div.layer.layer--spotlight').attr('id').match(/\d{3,}/);
	var linkClubs = '<a target="_blank" href="https://classic.planetromeo.com/gemeinsam/php/links/index.php?set=' + profileId + '">Clubs</a>';
	var linkGuestbook = '<a target="_blank" href="https://classic.planetromeo.com/gemeinsam/php/guestbook/lesen.php?empfaenger=' + profileId + '">Gästebuch</a>';
	var linkAlbum = '<a target="_blank" href="https://classic.planetromeo.com/auswertung/album/?set=' + profileId + '&user=">Fotoalbum</a>';
	var linkSaveUser = '<a target="_blank" href="https://classic.planetromeo.com/gemeinsam/php/myuser/index.php?partnerId=' + profileId + '">Profil speichern</a>';
	$('div.profile__container--error').append(
		'<div style="font-size:0.9em"><br/>' + linkClubs + '&nbsp;|&nbsp;' + linkGuestbook + '&nbsp;|&nbsp;' + linkAlbum + '&nbsp;|&nbsp;' + linkSaveUser + '</div>'
	);
}


// ***** Add links to contact edit page and message thread: save profile etc. *****
function linksContacts (jNode) {
	var profileId = $('#spotlight-container div.layer.layer--spotlight').attr('id').match(/\d{3,}/);
	var linkClubs = '<a target="_blank" href="https://classic.planetromeo.com/gemeinsam/php/links/index.php?set=' + profileId + '">Clubs</a>';
	var linkGuestbook = '<a target="_blank" href="https://classic.planetromeo.com/gemeinsam/php/guestbook/lesen.php?empfaenger=' + profileId + '">Gästebuch</a>';
	var linkAlbum = '<a target="_blank" href="https://classic.planetromeo.com/auswertung/album/?set=' + profileId + '&user=">Fotoalbum</a>';
	var linkSaveUser = '<a target="_blank" href="https://classic.planetromeo.com/gemeinsam/php/myuser/index.php?partnerId=' + profileId + '">Profil speichern</a>';
	$('div.profile__container--error').append(
		'<div style="font-size:0.9em"><br/>' + linkClubs + '&nbsp;|&nbsp;' + linkGuestbook + '&nbsp;|&nbsp;' + linkAlbum + '&nbsp;|&nbsp;' + linkSaveUser + '</div>'
	);
}


// ***** Insert BMI to profile, big radar tiles, and list view *****
function insertBMI (jNode) {
	// ;
}


// ***** Show picture info in slide show *****
function imgInfo (jNode) {
	var imgName;
	var eq = ($('div.swipe__element').length == 1) ? 0 : 1;
	imgName = $('div.swipe__element:eq(' + eq + ') div.picture__area').attr('style');
	if (imgName) {
		imgName = imgName.substring(imgName.indexOf('url(')+4, imgName.indexOf(')'));
		var imgNameTxt = imgName.substr(imgName.lastIndexOf('/')+1, 5) + '...';
		$('#swipe div.swipe__header div.js-counter').not(':has(a)').append(
			'<a target="_blank" style="color:rgba(255,255,255,0.8); font-size:0.85em" class="ml" href="' + imgName + '">' + imgNameTxt + '</a>'
		);
	}
}


// ***** Show picture info in picture rating *****
function ratingInfo (jNode) {
	var color;
	var imgName = $('#picture-rating img.picture-rating__image').attr('src');
	var imgNameTxt = imgName.substr(imgName.lastIndexOf('/')+1, 5) + '...';
	var imgNameMax = localStorage.getItem('reRatingMax');
	imgNameMax = (imgNameMax ? imgNameMax : imgNameTxt);
	if (imgNameTxt >= imgNameMax) {
		localStorage.setItem('reRatingMax', imgNameTxt);
		color = 'rgba(255,255,255,0.8)';
	} else {
		color = 'rgba(255,0,0,0.8)';
	}
	$('#picture-rating div.layer-header__title').append(
		'<a target="_blank" style="color:' + color + '; font-size:0.85em" class="ml" href="' + imgName + '">' + imgNameTxt + '</a>'
	);
}


// ***** Picture Search *****
function pictureSearch (jNode) {
	// ;
}


// ***** Relogin after timeout *****
function reLogin (jNode) {
	location.reload();
}



waitForKeyElements ("#contacts-menu, #trigger-region div div, a.contacts__search-close", keepContacts);
waitForKeyElements ("li.js-bookmarks li.is-selected", bookmarkTitle);
waitForKeyElements ("ul.search-nav__vers-list", forumsLink);
waitForKeyElements ("#visitors ul.ui-navbar__actions", statisticsLink);
waitForKeyElements ("#profile--forums section", loadForum);
waitForKeyElements ("#profile--statistics section", loadStatistics);
//waitForKeyElements ("#profile--history section", loadHistory);
waitForKeyElements ("#messages div.listitem a.js-preview span.txt-bold--medium", previewMessage); // #messages span.txt-pill--mini
waitForKeyElements ("#contacts span.plain-text-link", messageContacts);
waitForKeyElements ("#visitors div.tile__info", messageVisitors);
waitForKeyElements ("#profiles div.info__username, #profiles a.listresult", messageRadar);
waitForKeyElements ("#stream a.listitem__body", messageActivity);
waitForKeyElements ("div.is-profile-loaded", linksProfile);
waitForKeyElements ("div.profile__container--error", linksError);
waitForKeyElements ("#swipe div.swipe__element", imgInfo);
waitForKeyElements ("#picture-rating img.picture-rating__image", ratingInfo);
//waitForKeyElements (" ", linksContacts);
//waitForKeyElements (" ", insertBMI);
//waitForKeyElements ("img.pswp__img", pictureSearch);
waitForKeyElements ("div.layer--error", reLogin);
