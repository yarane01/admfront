var hierarchyControllers = angular.module('hierarchyControllers', []);

hierarchyControllers.controller('HierarchyCtrl',
    ['$q', '$rootScope', '$scope', '$http', '$route', 'api', '$timeout', 'modal',
        function ($q, $rootScope, $scope, $http, $route, api, $timeout, modal) {

            $rootScope.activePage = "hierarchy";

            $scope.context = {
                hideServiceAccounts: true,
                showUnits: true,
                showUsers: true,
                showAccounts: true,
                showGroups: true,
                changeParentTo: 0,
                filter: "",
                selected: undefined,
                createUnit: false,
                createGroup: false,
                createUser: false,
                createAccount: false,
                dataloaded: false
            };
            $scope.userRolesMap = userRolesMap;

            $scope.treeOptions = {
                nodeChildren: "children",
                dirSelectable: true,
                isSelectable: function
                    (node) {
                    return (node.status == 1) && (node.systemid != 100);
                },
                injectClasses: {
                    ul: "tree-branch",
                    li: "a2",
                    liSelected: "a2",
                    iExpanded: "a3",
                    iCollapsed: "a4",
                    iLeaf: "a5",
                    label: "a6",
                    labelSelected: "tree-selected"
                }
            };

            $scope.nodeSelected = function (node) {
                var errorCallback = {
                    error: function (response) {
                        $scope.infoloaded = true;
                        $scope.infoerror = true;
                        $scope.errorMessage = response.data.payload[0];
                    }
                }

                $scope.context.mode = 'none';
                $scope.infoloaded = false;
                $scope.infoerror = false;
                if (node != $scope.context.selected) {
                    switch (node.systemidtype) {
                        case 0:
                            $scope.context.parents = accountParents;
                            $scope.context.title = 'Account ' + node.name;
                            api.getAccount(node.systemid, angular.extend(
                                {
                                    ok: function (response) {
                                        $scope.account = response.data.payload[0];
                                        $scope.context.mode = 'account';
                                        $scope.infoloaded = true;
                                    }
                                },
                                errorCallback));
                            break;
                        case 1:
                            $scope.context.parents = userParents;
                            $scope.context.title = 'User ' + node.name;
                            api.getUser(node.systemid, angular.extend(
                                {
                                    ok: function (response) {
                                        $scope.user = response.data.payload[0];
                                        $scope.context.mode = 'user';
                                        $scope.infoloaded = true;
                                    }
                                },
                                errorCallback));
                            break;
                        case 2:
                            $scope.context.parents = unitParents;
                            $scope.context.title = 'Unit ' + node.name;
                            api.getUnit(node.systemid, angular.extend(
                                {
                                    ok: function (response) {
                                        $scope.unit = response.data.payload[0];
                                        $scope.context.mode = 'unit';
                                        $scope.infoloaded = true;
                                    }
                                },
                                errorCallback));
                            break;
                        case 3:
                            $scope.context.parents = groupParents;
                            $scope.context.title = 'Group ' + node.name;
                            api.getGroup(node.systemid, angular.extend(
                                {
                                    ok: function (response) {
                                        $scope.group = response.data.payload[0];
                                        $scope.context.mode = 'group';
                                        $scope.infoloaded = true;
                                    }
                                },
                                errorCallback));
                            break;
                    }
                }
                else {
                    $scope.context.mode = 'none';
                }
            };

            $scope.clearFilter = function () {
                $scope.context.filter = "";
            };

            $scope.hideServiceAccounts = function () {
                if (!$scope.context.hideServiceAccounts)
                    $scope.treeData = angular.copy(rawdata);
                else {
                    $scope.treeData = angular.copy(rawdata);
                    $scope.treeData[0].children = rawdata[0]
                        .children
                        .filter(function (item) {
                            return item.name != null ?
                                ((item.name.indexOf('Bank_') == -1) &&
                                (item.name.indexOf('Company') == -1) &&
                                (item.name.indexOf('STP') == -1))
                                : false;
                        })
                }
            };

            $scope.createUnitDialog = function () {
                $scope.unit = $rootScope.units.getEmpty();
                modal.showCreateUnitDialog($scope);
            };
            $scope.editUnitDialog = function () {
                modal.showEditUnitDialog($scope);
            };

            $scope.createGroupDialog = function () {
                $scope.group = $rootScope.groups.getEmpty();
                modal.showCreateGroupDialog($scope);
            };

            $scope.editGroupDialog = function () {
                modal.showEditGroupDialog($scope);
            };

            $scope.createUserDialog = function () {
                $scope.user = $rootScope.users.getEmpty();
                modal.showCreateUserDialog($scope);
            };
            $scope.editUserDialog = function () {
                $rootScope.fillUserRoles($scope.user);
                modal.showEditUserDialog($scope);
            };

            $scope.createAccountDialog = function () {
                $scope.account = $rootScope.accounts.getEmpty();
                modal.showCreateAccountDialog($scope, false, true);
            };
            $scope.editAccountDialog = function () {
                modal.showEditAccountDialog($scope);
            };

            $scope.changeParent = function () {
                //console.log($scope.context.changeParentTo);
                $scope.context.inprogress = true;
                api.changeParent($scope.context.selected.systemid,
                    $scope.context.changeParentTo,
                    angular.extend(errorHandler($scope),
                        {
                            ok: function (response) {
                                $scope.context.inprogress = false;
                                $route.reload();
                            }
                        }
                    ));
            };

            var unitCallback = angular.extend(errorHandler($scope),
                {
                    ok: function (response) {
                        $scope.context.inprogress = false;
                        $("#createUnit").modal('hide').on('hidden.bs.modal',
                            function () {
                                $route.reload();
                            }
                        );
                        $rootScope.units.upToDate = false;
                        $rootScope.updateUnits();
                    }
                })

            $scope.createUnit = function () {
                $scope.context.inprogress = true;
                api.createUnit($scope.unit, unitCallback);
            }

            $scope.updateUnit = function () {
                $scope.context.inprogress = true;
                api.updateUnit($scope.unit, unitCallback);
            }

            var groupCallback = angular.extend(errorHandler($scope),
                {
                    ok: function (response) {
                        $scope.context.inprogress = false;
                        $("#createGroup").modal('hide').on('hidden.bs.modal',
                            function () {
                                $route.reload();
                            }
                        );
                        $rootScope.groups.upToDate = false;
                        $rootScope.updateGroups();
                    }
                }
            )

            $scope.createGroup = function () {
                $scope.context.inprogress = true;
                api.createGroup($scope.group, groupCallback);
            }

            $scope.updateGroup = function () {
                $scope.context.inprogress = true;
                api.updateGroup($scope.group, groupCallback);
            }

            var userCallback = angular.extend(errorHandler($scope),
                {
                    ok: function (response) {
                        $scope.context.inprogress = false;
                        $rootScope.updateUserCount();
                        $("#createUser").modal('hide').on('hidden.bs.modal',
                            function () {
                                $route.reload();
                            }
                        );
                    }
                }
            )

            $scope.createUser = function () {
                $scope.context.inprogress = true;
                $scope.user.cleanup();
                api.createUser($scope.user, userCallback);
            }

            $scope.updateUser = function () {
                $scope.context.inprogress = true;
                $scope.user.cleanup();
                api.updateUser($scope.user, userCallback);
            }

            var accountCallback = angular.extend(errorHandler($scope),
                {
                    ok: function (response) {
                        $scope.context.inprogress = false;
                        $("#createAccount").modal('hide').on('hidden.bs.modal',
                            function () {
                                $route.reload();
                            }
                        );
                    }
                }
            )

            $scope.createAccount = function () {
                $scope.context.inprogress = true;
                api.createAccount($scope.account, accountCallback);
            }

            $scope.updateAccount = function () {
                $scope.context.inprogress = true;
                api.updateAccount($scope.account, accountCallback);
            }


            var rawdata, unitParents, groupParents, accountParents, userParents;
            $scope.selectedType = 'none';
            $rootScope.init().then(function () {
                $http.get(apiurl + '/hierarchy')
                    .then(function (result) {
                        rawdata = result.data.payload[0];
                        $scope.hideServiceAccounts();
                        $scope.expandedNodes = [$scope.treeData[0]];
                        unitParents = $rootScope.units.data;

                        groupParents = $rootScope.getGroupParents();

                        accountParents = $rootScope.getAccountParents();

                        userParents = $rootScope.units.data
                            .concat($rootScope.groups.data.filter(
                                function (item) {
                                    return item.type == 1;
                                }
                            )
                        );
                        $scope.context.parents = userParents;
                        $scope.context.dataloaded = true;
                    });
            })
        }
    ])
;
