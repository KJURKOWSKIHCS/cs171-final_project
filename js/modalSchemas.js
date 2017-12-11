/**
 * Created by Krystian Jurkowski on 12/4/2017.
 */

var eventSchema = '<div class="modal-content">\
    <div class="modal-header">\
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
        <h4 class="modal-title" id="eventDate"></h4>\
    </div>\
    <div class="modal-body">\
        <div class="container-fluid">\
            <div class="row-fluid">\
                <div class="col-lg-6">\
                    <div id="eventPersonName"></div>\
                    <div id="eventPlace"></div>\
                    <div id="eventInfo"></div>\
                </div>\
                <div class="col-lg-6">\
                    <div id="existingPicture"></div>\
                </div>\
            </div>\
        </div>\
    </div>\
    <div class="modal-footer">\
        <button type="button" class="btn btn-default" data-dismiss="modal" id="modalClose">Close</button>\
    </div>\
</div>'





var auschwitzSchema = '<div class="modal-content">\
    <div class="modal-header">\
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
        <h4 class="modal-title" id="campName"></h4>\
    </div>\
    <div class="modal-body">\
        <div role="tabpanel">\
            <ul class="nav nav-tabs" role="tablist">\
                <li role="presentation" class="active"><a href="#campTab" aria-controls="campTab" role="tab" data-toggle="tab">Camp Info</a></li>\
                <li role="presentation"><a href="#ethnicityTab" aria-controls="ethnicityTab" role="tab" data-toggle="tab">Camp by Ethnicity</a></li>\
                <li role="presentation"><a href="#arrivalsTab" aria-controls="arrivalsTab" role="tab" data-toggle="tab">Camp by Arrivals (Early)</a></li>\
                <li role="presentation"><a href="#arrivalsTabLater" aria-controls="arrivalsTabLater" role="tab" data-toggle="tab">Camp by Arrivals (Late)</a></li>\
                <li role="presentation"><a href="#factTab" class="factTabLink" aria-controls="factTab" role="tab" data-toggle="tab">Camp Facts</a></li>\
            </ul>\
            <div class="tab-content">\
                <div role="tabpanel" class="tab-pane active" id="campTab">\
                    <div class="container-fluid">\
                        <div class="row-fluid">\
                            <div class="col-lg-6">\
                                <div id="campType"></div>\
                                <div id="countryToday"></div>\
                                <div id="operationDates"></div>\
                                <div id="estDeaths"></div>\
                                <div id="estPrisoners"></div>\
                                <div id="totalYears"></div>\
                            </div>\
                            <div class="col-lg-6">\
                                <div id="existingPicture"></div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
                <div role="tabpanel" class="tab-pane" id="ethnicityTab">\
                    <div class="container-fluid">\
                        <div class="row-fluid">\
                            <div class="col-lg-11">\
                                <div id="campVis1"></div>\
                            </div>\
                            <div class="col-lg-1">\
                                <div id="legendBox"></div>\
                            </div>\
                        </div>\
                        <div class="row-fluid">\
                            <div class="col-lg-12">\
                                <div class="col-lg-4">\
                                    <div id="visInfoEthnicity"></div>\
                                </div>\
                                <div class="col-lg-8">\
                                    <div id="visInfoDeported"></div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
                <div role="tabpanel" class="tab-pane" id="arrivalsTab">\
                    <div class="container-fluid">\
                        <div id="stack-chart"></div>\
                    </div>\
                </div>\
                <div role="tabpanel" class="tab-pane" id="arrivalsTabLater">\
                    <div class="container-fluid">\
                        <div id="stack-chart-later"></div>\
                    </div>\
                </div>\
                <div role="tabpanel" class="tab-pane" id="factTab">\
                    <div class="container-fluid">\
                        <div id="factGeneratorContainer">\
                            <button id="factGenerator" class="btn btn-default">Generate a fact</button>\
                            <div id="content" class="fadeInText"></div>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>\
    </div>\
    <div class="modal-footer">\
        <button type="button" class="btn btn-default" data-dismiss="modal" id="modalClose">Close</button>\
    </div>\
</div>'


var campSchemaTabSpecific = '<div class="modal-content">\
    <div class="modal-header">\
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
        <h4 class="modal-title" id="campName"></h4>\
    </div>\
    <div class="modal-body">\
        <div role="tabpanel">\
            <ul class="nav nav-tabs" role="tablist">\
                <li role="presentation" class="active"><a href="#campTab" aria-controls="campTab" role="tab" data-toggle="tab">Camp Info</a></li>\
                <li role="presentation"><a href="#factTab" class="factTabLink" aria-controls="factTab" role="tab" data-toggle="tab">Camp Facts</a></li>\
            </ul>\
            <div class="tab-content">\
                <div role="tabpanel" class="tab-pane active" id="campTab">\
                    <div class="container-fluid">\
                        <div class="row-fluid">\
                            <div class="col-lg-6">\
                                <div id="campType"></div>\
                                <div id="countryToday"></div>\
                                <div id="operationDates"></div>\
                                <div id="estDeaths"></div>\
                                <div id="estPrisoners"></div>\
                                <div id="totalYears"></div>\
                            </div>\
                            <div class="col-lg-6">\
                                <div id="existingPicture"></div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
                <div role="tabpanel" class="tab-pane" id="factTab">\
                    <div class="container-fluid">\
                        <div id="factGeneratorContainer">\
                            <button id="factGenerator" class="btn btn-default">Generate a fact</button>\
                            <div id="content" class="fadeInText"></div>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>\
    </div>\
    <div class="modal-footer">\
        <button type="button" class="btn btn-default" data-dismiss="modal" id="modalClose">Close</button>\
    </div>\
</div>'

var campSchemaGeneral = '<div class="modal-content">\
    <div class="modal-header">\
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
        <h4 class="modal-title" id="campName"></h4>\
    </div>\
    <div class="modal-body">\
        <div class="container-fluid">\
            <div class="row-fluid">\
                <div class="col-lg-6">\
                    <div id="campType"></div>\
                    <div id="countryToday"></div>\
                    <div id="operationDates"></div>\
                    <div id="estDeaths"></div>\
                    <div id="estPrisoners"></div>\
                    <div id="totalYears"></div>\
                </div>\
                <div class="col-lg-6">\
                    <div id="existingPicture"></div>\
                </div>\
            </div>\
        </div>\
    </div>\
    <div class="modal-footer">\
        <button type="button" class="btn btn-default" data-dismiss="modal" id="modalClose">Close</button>\
    </div>\
</div>'


