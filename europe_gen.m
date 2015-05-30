clear all
clc
%%
f = fopen('europe_raw.txt');

%First index all nodes

line = fgetl(f);
i = 1;
while ischar(line)
    if strncmpi(line, 'node:', 5)
        nodes_r{i} = strtrim(line(6:end));
        i = i + 1;
    end
    line = fgetl(f);
end
%Change to alphabetic order
[~, order] = sort(nodes_r);
nodes = nodes_r(order);

% Fix edges
frewind(f);

line = fgetl(f);
i = 1;
while ischar(line)
    if strncmpi(line, 'edges:', 6)
        str = strsplit(strtrim(line(7:end)),',');
        edges{i} = [];
        for j=1:length(str)
            k = find(ismember(nodes, strtrim(str(j))));
            if isempty(k)
                error([nodes_r{i} ' contains a non valid edge: ' str{j}]);
            end
            edges{i} = [edges{i} k];
        end
        i = i+1;
    end
    
    line = fgetl(f);
end

fclose(f);
edges = edges(order); %Reorder to correct ordered index

%% Get some positions
karta = imread('europe.png');
imshow(karta);
disp('Pick a location and press enter for the following nodes:');
for i=1:length(nodes)
    disp(nodes(i));
    [u v] = getpts;
    x(i) = u(end);
    y(i) = v(end);
end

hold on
plot(x, y, 'xk');
hold off

%% Node typescript
strnn = 'static Nodes: GraphNode[] = [';

for i = 1:length(nodes)
    strnn = [strnn '{ name: ''' nodes{i} ''', x: ' num2str(round(x(i))) ', y: ' num2str(round(y(i))) ' },' char(10)];
end

strnn = [strnn(1:end-2) '];'];
disp(strnn);

%% Edges typescript
stredges = 'static Edges: [number, number][][] = [';

for i = 1:length(nodes)
    stredges = [stredges '['];
    for j = 1:length(edges{i})
        from = i-1;
        e = edges{i};
        to = e(j)-1;
        stredges = [stredges '[' num2str(from) ', ' num2str(to) '],'];
    end
    if (~isempty(j))
        stredges = [stredges(1:end-1)];
    end
    stredges = [stredges '],' char(10)];
end

stredges = [stredges(1:end-2) '];']

disp(stredges);