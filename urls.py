from django.conf.urls.defaults import patterns, url

# Urls for static pages, which render directly to a template
urlpatterns = patterns('django.views.generic.simple',
                       
    url(r'^howtouse', 'direct_to_template', kwargs={'template': 'learnbytrace/howtouse.html'},
        name="learnbytrace_howtouse"),
    url(r'^about', 'direct_to_template', kwargs={'template': 'learnbytrace/about.html'},
        name="learnbytrace_about"),
    url(r'^add', 'direct_to_template', kwargs={'template': 'learnbytrace/add.html'},
        name="learnbytrace_addtrace")
)
# Urls that lead to views
urlpatterns += patterns('learnbytrace.views',                  
    url(r'^$', 'algorithm_list', name="learnbytrace_algorithms"),
    url(r'^traces/(?P<trace_id>\d+)/$', 'executiontrace_detail', name="learnbytrace_traces")                 
) 