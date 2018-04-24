angular.module("managerApp").config(function (SidebarMenuProvider) {
    "use strict";
    // add translation path
    SidebarMenuProvider.addTranslationPath("../components/sidebar");
}).run(function ($q, $translate, Toast, SidebarMenu, SidebarService, IaasSectionSidebarService, PaasSectionSidebarService,
                 MetricsSectionSidebarService, VrackSectionSidebarService, LoadBalancerSidebarService, CloudDesktopSidebarService,
                 ProductsService, SessionService, FeatureAvailabilityService, REDIRECT_URLS, URLS, TARGET) {
    "use strict";

    /*==========================================
     =            SIDEBAR MENU ITEMS            =
     ==========================================*/

    function getServices (products) {
        return {
            iaas: SidebarService.getServices(IaasSectionSidebarService.section, products),
            paas: SidebarService.getServices(PaasSectionSidebarService.section, products),
            metrics: SidebarService.getServices(MetricsSectionSidebarService.section, products),
            vracks: SidebarService.getServices(VrackSectionSidebarService.section, products),
            load_balancer: SidebarService.getServices(LoadBalancerSidebarService.section, products),
            cloud_desktop: SidebarService.getServices(CloudDesktopSidebarService.section, products)
        };
    }
    /*----------  SERVICES MENU ITEMS  ----------*/
    function initSidebarMenuItems (services, locale) {
        if (TARGET !== "US") {
            IaasSectionSidebarService.fillSection(services.iaas);
            PaasSectionSidebarService.fillSection(services.paas);
            MetricsSectionSidebarService.fillSection(services.metrics);
        }

        SidebarMenu.addMenuItem({
            title: $translate.instant("cloud_sidebar_section_license"),
            icon: "ovh-font ovh-font-certificate",
            url: REDIRECT_URLS.license,
            target: "_parent"
        });

        SidebarMenu.addMenuItem({
            title: $translate.instant("cloud_sidebar_section_ip"),
            icon: "ovh-font ovh-font-ip",
            url: REDIRECT_URLS.ip,
            target: "_parent"
        });

        if (FeatureAvailabilityService.hasFeature("LOAD_BALANCER", "sidebarMenu", locale)) {
            LoadBalancerSidebarService.fillSection(services.load_balancer);
        }

        VrackSectionSidebarService.fillSection(services.vracks);

        if (FeatureAvailabilityService.hasFeature("CLOUD_DESKTOP", "sidebarMenu", locale)) {
            CloudDesktopSidebarService.fillSection(services.cloud_desktop);
        }
    }

    /*-----  End of SIDEBAR MENU ITEMS  ------*/

    /*============================================
     =            ACTIONS MENU OPTIONS            =
     ============================================*/

    function initSidebarMenuActionsOptions (locale) {

        _.forEach([
            IaasSectionSidebarService.section,
            PaasSectionSidebarService.section,
            MetricsSectionSidebarService.section,
            VrackSectionSidebarService.section,
            CloudDesktopSidebarService.section
        ], section => {
            _.forEach(section, product => {
                if (FeatureAvailabilityService.hasFeature(product.type, "sidebarOrder", locale)) {
                    let order = SidebarService.addOrder(product);
                    if (order) {
                        SidebarMenu.addActionsMenuOption(order);
                    }
                }
            })
        });

        const actionsMenuOptions = [];
        actionsMenuOptions.push({
            title: $translate.instant("cloud_sidebar_actions_menu_ip"),
            icon: "ovh-font ovh-font-ip",
            href: REDIRECT_URLS.ip,
            target: "_parent"
        });

        if (TARGET !== "US") {
            actionsMenuOptions.push({
                title: $translate.instant("cloud_sidebar_actions_menu_iplb"),
                icon: "ovh-font ovh-font-ip",
                href: URLS.website_order.load_balancer[locale],
                target: "_blank",
                external: true
            });
        }

        actionsMenuOptions.push({
            title: $translate.instant("cloud_sidebar_actions_menu_licence"),
            icon: "ovh-font ovh-font-certificate",
            href: REDIRECT_URLS.license,
            target: "_parent"
        });

        SidebarMenu.addActionsMenuOptions(actionsMenuOptions);

        if (REDIRECT_URLS.orderSql) {
            SidebarMenu.addActionsMenuOptions([{
                title: $translate.instant("cloud_sidebar_actions_menu_clouddb"),
                icon: "ovh-font ovh-font-database",
                href: REDIRECT_URLS.orderSql,
                target: "_blank",
                external: true
            }]);
        }
    }

    /*-----  End of ACTIONS MENU OPTIONS  ------*/

    /*======================================
     =            INITIALIZATION            =
     ======================================*/

    function init () {
        // set initialization promise
        var promise = $q.all({
            user: SessionService.getUser(),
            products: ProductsService.getProducts(),
            translate: $translate.refresh()
        }).catch(function (err) {
            Toast.error([$translate.instant("cloud_sidebar_error"), err.data.message || ""].join(" "));
        });

        SidebarMenu.setInitializationPromise(promise);

        // wait that sidebar is loaded (wait that translations are loaded and init promise is resolved)
        SidebarMenu.loadDeferred.promise
            .then(function (data) {
                initSidebarMenuActionsOptions(data.user.ovhSubsidiary);
                var services = getServices(data.products.results);
                return initSidebarMenuItems(services, data.user.ovhSubsidiary);
            })
            .then(function () {
                //After sidebar elements are all loaded, check if there is an element for the current state and select it.
                SidebarMenu.manageStateChange();
            });
    }

    /*-----  End of INITIALIZATION  ------*/

    init();

});
