class VpsMonitoringSlaCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, preview, serviceName, state, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.serviceName = serviceName;
        this.preview = preview;
        this.state = state;
        this.VpsService = VpsService;

        this.loader = {
            init: false,
            save: false
        };
        this.currentState = !this.state;
        this.title = this.$translate.instant("vps_configuration_sla_title_enable");
        this.vps = {};
    }

    $onInit () {
        this.loader.init = true;
        if (this.currentState) {
            this.title = this.$translate.instant("vps_configuration_sla_title_disable");
        }
        if (this.preview) {
            this.title = this.$translate.instant("vps_dashboard_monitoring_sla_ips");
        }
        this.VpsService.getSelectedVps(this.serviceName)
            .then(vps => { this.vps = vps })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loader.init = false });
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.loader.save = true;
        this.VpsService.update(this.serviceName, { slaMonitoring: this.state })
            .then(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_monitoring_sla_ok_" + this.state)))
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_monitoring_sla_error_" + this.state)))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            });
    }
}

angular.module("managerApp").controller("VpsMonitoringSlaCtrl", VpsMonitoringSlaCtrl);
